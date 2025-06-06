using System;
using System.Data;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Azure;
using Azure.DigitalTwins.Core;
using Azure.DigitalTwins.Core.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Devices.Provisioning.Service;
using Microsoft.Azure.Devices.Shared;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace GridWatch.Functions
{
    public class DeviceProvision
    {
        private readonly ILogger<DeviceProvision> _logger;
        private readonly DigitalTwinsClient _dtClient;
        private readonly SqlConnection _sqlConnection;

        public DeviceProvision(
            ILogger<DeviceProvision> logger,
            DigitalTwinsClient dtClient,
            SqlConnection sqlConnection
        )
        {
            _logger = logger;
            _dtClient = dtClient;
            _sqlConnection = sqlConnection;
        }

        [Function("DeviceProvision")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest req
        )
        {
            _logger.LogInformation("📡 Device Provisioning Request Received");

            try
            {
                // Deserialize incoming request
                var data = JsonSerializer.Deserialize<DeviceProvisionRequest>(
                    await new StreamReader(req.Body).ReadToEndAsync(),
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                // Validate incoming data thoroughly
                if (data?.DeviceRuntimeContext?.RegistrationId is null)
                    return new BadRequestObjectResult("Registration ID is required.");

                var regId = data.DeviceRuntimeContext.RegistrationId;
                var linkedHub = data.LinkedHubs is { Length: > 0 } ? data.LinkedHubs[0] : null;

                if (string.IsNullOrEmpty(linkedHub))
                    return new BadRequestObjectResult("Linked IoT Hub is required.");

                var payload = data.DeviceRuntimeContext.Payload;
                if (payload?.Model is null)
                    return new BadRequestObjectResult("Device model is required.");

                // Create device twin for IoT Hub provisioning
                var twinResponse = CreateDeviceTwin(
                    payload.Model,
                    data.DeviceRuntimeContext.ExistingTwin ?? new ExistingTwin()
                );

                // Construct provisioning response
                var response = new ProvisioningResponse
                {
                    IotHubHostName = linkedHub,
                    InitialTwin = twinResponse,
                };

                // Create corresponding resources in Azure Digital Twins
                await CreateDigitalTwinAsync(regId, payload);
                await CreateFeedersAsync(regId, payload.Model);
                await LogProvisionToSqlAsync(regId, payload);

                return new OkObjectResult(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error during provisioning.");
                return new StatusCodeResult(500);
            }
        }

        private TwinState CreateDeviceTwin(string model, ExistingTwin existing)
        {
            var tags = existing.Tags is not null
                ? JsonSerializer.Deserialize<TwinCollection>(
                    JsonSerializer.Serialize(existing.Tags)
                )
                : new TwinCollection();

            tags["deviceModel"] ??= model;
            tags["alarmState"] ??= new TwinCollection { ["status"] = 0, ["message"] = "" };

            var desired = new TwinCollection
            {
                ["telemetry"] = new TwinCollection
                {
                    ["interval"] = "60s",
                    ["batch"] = 1,
                    ["precision"] = 1,
                    ["current"] = 1,
                    ["voltage"] = 1,
                    ["frequency"] = 1,
                    ["power"] = 1,
                    ["harmonics"] = 1,
                    ["temperature"] = 0,
                    ["h1"] = 3,
                    ["h2"] = 5,
                    ["h3"] = 7,
                },
                ["eventwindow"] = new TwinCollection { ["interval"] = "60s", ["count"] = 5 },
                ["events"] = new TwinCollection
                {
                    ["ml"] = new TwinCollection { ["id"] = 1, ["enable"] = 0 },
                    ["mr"] = new TwinCollection { ["id"] = 2, ["enable"] = 0 },
                    ["ov"] = new TwinCollection
                    {
                        ["id"] = 3,
                        ["enable"] = 0,
                        ["level"] = "245",
                    },
                    ["oc"] = new TwinCollection
                    {
                        ["id"] = 4,
                        ["enable"] = 0,
                        ["level"] = "100",
                    },
                    ["uv"] = new TwinCollection
                    {
                        ["id"] = 5,
                        ["enable"] = 0,
                        ["level"] = "215",
                    },
                    ["uc"] = new TwinCollection
                    {
                        ["id"] = 6,
                        ["enable"] = 0,
                        ["level"] = "5",
                    },
                    ["pkt"] = new TwinCollection
                    {
                        ["id"] = 7,
                        ["enable"] = 0,
                        ["level"] = "80",
                    },
                },
            };

            return new TwinState(tags, desired);
        }

        private async Task CreateDigitalTwinAsync(string deviceId, Payload payload)
        {
            string dtId = $"device-{deviceId}";

            if (!await _dtClient.GetDigitalTwinAsyncSafe(dtId))
            {
                var twinData = new BasicDigitalTwin
                {
                    Id = dtId,
                    Metadata = { ModelId = "dtmi:gridwatch:GridWatchDevice;1" },
                    Contents =
                    {
                        ["deviceId"] = deviceId,
                        ["name"] = payload.Identifier,
                        ["model"] = payload.Model,
                        ["manufacturer"] = "GridWatch",
                    },
                };
                await _dtClient.CreateOrReplaceDigitalTwinAsync(dtId, twinData);
            }

            string substationId = $"substation-{deviceId}";
            if (!await _dtClient.GetDigitalTwinAsyncSafe(substationId))
            {
                var substationTwin = new BasicDigitalTwin
                {
                    Id = substationId,
                    Metadata = { ModelId = "dtmi:gridwatch:Substation;1" },
                    Contents = { ["substationId"] = substationId, ["model"] = payload.Model },
                };
                await _dtClient.CreateOrReplaceDigitalTwinAsync(substationId, substationTwin);
            }

            await _dtClient.CreateOrReplaceRelationshipAsync(
                substationId,
                $"monitoredBy-{dtId}",
                new BasicRelationship
                {
                    Id = $"monitoredBy-{dtId}",
                    SourceId = substationId,
                    TargetId = dtId,
                    Name = "monitoredBy",
                }
            );
        }

        private async Task CreateFeedersAsync(string deviceId, string model)
        {
            int feederCount = model switch
            {
                var m when m.Contains("GW200G") => 6,
                var m when m.Contains("GW200P") => 2,
                var m when m.Contains("GW200S") => 1,
                _ => 0,
            };

            string substationId = $"substation-{deviceId}";

            for (int i = 1; i <= feederCount; i++)
            {
                string feederId = $"feeder-{deviceId}-{i}";

                if (!await _dtClient.GetDigitalTwinAsyncSafe(feederId))
                {
                    await _dtClient.CreateOrReplaceDigitalTwinAsync(
                        feederId,
                        new BasicDigitalTwin
                        {
                            Id = feederId,
                            Metadata = { ModelId = "dtmi:gridwatch:Feeder;1" },
                            Contents = { ["feederId"] = feederId },
                        }
                    );

                    await _dtClient.CreateOrReplaceRelationshipAsync(
                        substationId,
                        $"feeds-{feederId}",
                        new BasicRelationship
                        {
                            Id = $"feeds-{feederId}",
                            SourceId = substationId,
                            TargetId = feederId,
                            Name = "feeds",
                        }
                    );
                }
            }
        }

        private async Task LogProvisionToSqlAsync(string deviceId, Payload payload)
        {
            await _sqlConnection.OpenAsync();
            using var cmd = _sqlConnection.CreateCommand();
            cmd.CommandText =
                @"
                IF NOT EXISTS (SELECT 1 FROM Devices WHERE GridWatchDeviceId = @deviceId)
                INSERT INTO Devices (GridWatchDeviceId, Name, Location, Status, Model)
                VALUES (@deviceId, @name, 'TBD', 'Pending', @model);";

            cmd.Parameters.AddWithValue("@deviceId", deviceId);
            cmd.Parameters.AddWithValue("@name", payload.Identifier ?? "Unknown");
            cmd.Parameters.AddWithValue("@model", payload.Model);
            await cmd.ExecuteNonQueryAsync();
        }
    }

    public static class DigitalTwinExtensions
    {
        public static async Task<bool> GetDigitalTwinAsyncSafe(
            this DigitalTwinsClient client,
            string twinId
        )
        {
            try
            {
                await client.GetDigitalTwinAsync<BasicDigitalTwin>(twinId);
                return true;
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return false;
            }
        }
    }

    // ✅ Request Model
    public class DeviceProvisionRequest
    {
        public DeviceRuntimeContext? DeviceRuntimeContext { get; set; }
        public string[]? LinkedHubs { get; set; }
    }

    public class DeviceRuntimeContext
    {
        public string? RegistrationId { get; set; }
        public Payload? Payload { get; set; }
        public ExistingTwin? ExistingTwin { get; set; }
    }

    public class Payload
    {
        public string? Identifier { get; set; }
        public string? Model { get; set; }
        public dynamic? ChannelMask { get; set; }
    }

    public class ExistingTwin
    {
        public dynamic? Tags { get; set; }
    }

    // ✅ Response Model
    public class ProvisioningResponse
    {
        public string? IotHubHostName { get; set; }
        public TwinState? InitialTwin { get; set; }
    }
}
