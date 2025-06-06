using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure.Messaging.EventHubs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace GridWatch.Function
{
    public class DeviceState
    {
        private readonly ILogger<DeviceState> _logger;
        private readonly DigitalTwinsClient _digitalTwinsClient;
        private readonly SqlConnection _sqlConnection;

        public DeviceState(ILogger<DeviceState> logger)
        {
            _logger = logger;
#pragma warning disable CS8604 // Possible null reference argument.
            _digitalTwinsClient = new DigitalTwinsClient(
                new Uri(Environment.GetEnvironmentVariable("ADT_INSTANCE_URL")),
                new DefaultAzureCredential()
            );
#pragma warning restore CS8604 // Possible null reference argument.

            _sqlConnection = new SqlConnection(
                Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
            );
        }

        [Function(nameof(DeviceState))]
        public async Task Run(
            [EventHubTrigger(
                "%EVENTHUB_STATE%",
                Connection = "IOTHUB_CONNECTION",
                ConsumerGroup = "%CONSUMER_GROUP_STATE%"
            )]
                EventData[] events
        )
        {
            foreach (var @event in events)
            {
                string eventBody = Encoding.UTF8.GetString(@event.EventBody);
                var eventType = @event.Properties.ContainsKey("opType")
                    ? @event.Properties["opType"].ToString()
                    : "unknown";

                var deviceId = @event.SystemProperties["iothub-connection-device-id"].ToString();

                _logger.LogInformation($"Received '{eventType}' event for device: {deviceId}");

                switch (eventType)
                {
                    case "deviceConnected":
                    case "deviceDisconnected":
#pragma warning disable CS8604 // Possible null reference argument.
                        await UpdateDeviceConnectionStateAsync(
                            deviceId,
                            eventType == "deviceConnected"
                        );
#pragma warning restore CS8604 // Possible null reference argument.
                        break;

                    case "twinChangeEvents":
#pragma warning disable CS8604 // Possible null reference argument.
                        await HandleTwinChangeEventAsync(deviceId, eventBody);
#pragma warning restore CS8604 // Possible null reference argument.
                        break;

                    default:
                        _logger.LogWarning($"Unhandled event type: {eventType}");
                        break;
                }
            }
        }

        private async Task UpdateDeviceConnectionStateAsync(string deviceId, bool isConnected)
        {
            string dtId = $"device-{deviceId}";
            string connectionStatus = isConnected ? "Connected" : "Disconnected";

            // Update Digital Twin with connection status
            var updatePatch = new Azure.JsonPatchDocument();
            updatePatch.AppendReplace("/status", connectionStatus);
            updatePatch.AppendReplace("/lastTelemetryReceived", DateTime.UtcNow);

            await _digitalTwinsClient.UpdateDigitalTwinAsync(dtId, updatePatch);

            // Update SQL Database with device status and last communicated time
            await _sqlConnection.OpenAsync();
            using var cmd = _sqlConnection.CreateCommand();
            cmd.CommandText =
                @"
        UPDATE Devices
        SET Status = @status, LastCommunicated = @lastCommunicated
        WHERE GridWatchDeviceId = @deviceId;

        INSERT INTO Notifications (DeviceId, NotificationTypeId, Message)
        SELECT Id, 2, @notificationMessage FROM Devices WHERE GridWatchDeviceId = @deviceId;";

            string notificationMessage =
                $"Device {deviceId} {connectionStatus.ToLower()} at {DateTime.UtcNow:u}.";

            cmd.Parameters.AddWithValue("@deviceId", deviceId);
            cmd.Parameters.AddWithValue("@status", isConnected ? "Online" : "Offline");
            cmd.Parameters.AddWithValue("@lastCommunicated", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@notificationMessage", notificationMessage);

            await cmd.ExecuteNonQueryAsync();
            await _sqlConnection.CloseAsync();

            _logger.LogInformation(
                $"Updated connection state for {deviceId} to {connectionStatus}"
            );
        }

        private async Task HandleTwinChangeEventAsync(string deviceId, string eventBody)
        {
            using var jsonDoc = JsonDocument.Parse(eventBody);

            if (
                !jsonDoc.RootElement.TryGetProperty("properties", out var properties)
                || !properties.TryGetProperty("reported", out var reported)
            )
            {
                _logger.LogWarning($"No reported properties found for device {deviceId}.");
                return;
            }

            string dtId = $"device-{deviceId}";
            var updatePatch = new Azure.JsonPatchDocument();

            string? firmwareVersion = reported
                .GetProperty("info")
                .GetProperty("firmware")
                .GetString();
            DateTime? certificateExpiry = reported
                .GetProperty("security")
                .GetProperty("certexpire")
                .GetDateTime();
            string? latitude = reported.GetProperty("substation").GetProperty("lat").GetString();
            string? longitude = reported.GetProperty("substation").GetProperty("lon").GetString();

            await _sqlConnection.OpenAsync();
            using var cmdCheck = _sqlConnection.CreateCommand();
            cmdCheck.CommandText =
                @"SELECT FirmwareVersion, CertificateExpiry, Latitude, Longitude FROM Devices WHERE GridWatchDeviceId = @deviceId";
            cmdCheck.Parameters.AddWithValue("@deviceId", deviceId);

            using var reader = await cmdCheck.ExecuteReaderAsync();
            bool firmwareChanged = false,
                certificateChanged = false,
                locationChanged = false;

            if (await reader.ReadAsync())
            {
                firmwareChanged = firmwareVersion != reader["FirmwareVersion"].ToString();
                certificateChanged =
                    certificateExpiry != (reader["CertificateExpiry"] as DateTime?);
                locationChanged =
                    latitude != reader["Latitude"].ToString()
                    || longitude != reader["Longitude"].ToString();
            }

            await reader.CloseAsync();

            if (firmwareChanged)
                updatePatch.AppendReplace("/firmwareVersion", firmwareVersion);

            if (certificateChanged)
                updatePatch.AppendReplace("/certificateExpiry", certificateExpiry);

            if (locationChanged)
                updatePatch.AppendReplace("/location", new { latitude, longitude });

            await _digitalTwinsClient.UpdateDigitalTwinAsync(dtId, updatePatch);

            using var cmdUpdate = _sqlConnection.CreateCommand();
            cmdUpdate.CommandText =
                @"
        UPDATE Devices 
        SET FirmwareVersion = @firmwareVersion, CertificateExpiry = @certificateExpiry, 
            Latitude = @latitude, Longitude = @longitude, LastCommunicated = @lastCommunicated 
        WHERE GridWatchDeviceId = @deviceId";

            cmdUpdate.Parameters.AddWithValue("@deviceId", deviceId);
            cmdUpdate.Parameters.AddWithValue(
                "@firmwareVersion",
                firmwareVersion ?? (object)DBNull.Value
            );
            cmdUpdate.Parameters.AddWithValue(
                "@certificateExpiry",
                certificateExpiry ?? (object)DBNull.Value
            );
            cmdUpdate.Parameters.AddWithValue("@latitude", latitude ?? (object)DBNull.Value);
            cmdUpdate.Parameters.AddWithValue("@longitude", longitude ?? (object)DBNull.Value);
            cmdUpdate.Parameters.AddWithValue("@lastCommunicated", DateTime.UtcNow);

            await cmdUpdate.ExecuteNonQueryAsync();

            if (firmwareChanged)
                await CreateNotificationAsync(
                    deviceId,
                    $"Firmware updated to {firmwareVersion}",
                    2
                );

            if (certificateChanged)
                await CreateNotificationAsync(
                    deviceId,
                    $"Certificate expiry updated to {certificateExpiry:yyyy-MM-dd}",
                    2
                );

            if (locationChanged)
                await CreateNotificationAsync(
                    deviceId,
                    $"Location updated to Lat:{latitude}, Lon:{longitude}",
                    2
                );

            await _sqlConnection.CloseAsync();

            _logger.LogInformation($"Updated twin and database entries for device {deviceId}.");
        }

        private async Task CreateNotificationAsync(
            string deviceId,
            string message,
            int notificationTypeId
        )
        {
            using var cmd = _sqlConnection.CreateCommand();
            cmd.CommandText =
                @"
        INSERT INTO Notifications (DeviceId, Message, NotificationTypeId) 
        SELECT Id, @message, @notificationTypeId FROM Devices WHERE GridWatchDeviceId = @deviceId";

            cmd.Parameters.AddWithValue("@deviceId", deviceId);
            cmd.Parameters.AddWithValue("@message", message);
            cmd.Parameters.AddWithValue("@notificationTypeId", notificationTypeId);

            await cmd.ExecuteNonQueryAsync();
        }
    }
}
