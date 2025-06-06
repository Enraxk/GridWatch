using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Azure;
using Azure.DigitalTwins.Core;
using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Producer;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Shared;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;

namespace GridWatch.Functions;

public class DeviceTelemetry
{
    private readonly ILogger<DeviceTelemetry> _logger;
    private readonly DigitalTwinsClient _dtClient;
    private readonly SqlConnection _sqlConnection;
    private readonly EventHubProducerClient _eventHubClient;
    private readonly RegistryManager _registryManager;

    public DeviceTelemetry(
        ILogger<DeviceTelemetry> logger,
        DigitalTwinsClient dtClient,
        SqlConnection sqlConnection,
        EventHubProducerClient eventHubClient,
        IotHubConnection iotHubConnection
    )
    {
        _logger = logger;
        _dtClient = dtClient;
        _sqlConnection = sqlConnection;
        _eventHubClient = eventHubClient;

        // IoT Hub connection string injected from environment variables (local.settings.json or Azure config)
        _registryManager = RegistryManager.CreateFromConnectionString(
            iotHubConnection.ConnectionString
        );
    }

    [Function("DeviceTelemetry")]
    public async Task Run(
        [EventHubTrigger(
            "%EVENTHUB_TELEMETRY%",
            Connection = "IOTHUB_CONNECTION",
            ConsumerGroup = "%CONSUMER_GROUP_TELEMETRY%"
        )]
            EventData[] events
    )
    {
        foreach (var eventData in events)
        {
            string body = Encoding.UTF8.GetString(eventData.EventBody.ToArray());
            var root = JsonSerializer.Deserialize<TelemetryRoot>(body);

            if (root == null)
            {
                _logger.LogWarning("⚠️ Invalid payload.");
                continue;
            }

            // Extract telemetry into two separate lists
            // Extract telemetry into two separate lists
            var substationTelemetry = ExtractSubstationTelemetry(root);
            var feederTelemetry = ExtractFeederTelemetry(root);

            // 🔹 Call UpdateDigitalTwinAsync here, after extracting telemetry
            await UpdateDigitalTwinAsync(root.Id, substationTelemetry, feederTelemetry);

            // Process substation telemetry
            if (substationTelemetry.Count > 0)
            {
                using var substationBatch = await _eventHubClient.CreateBatchAsync();
                foreach (var telemetry in substationTelemetry)
                {
                    var eventPayload = new EventData(
                        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(telemetry))
                    );
                    eventPayload.Properties["TelemetryType"] = "substation";
                    if (!substationBatch.TryAdd(eventPayload))
                    {
                        _logger.LogWarning("⚠️ Substation telemetry event too large to batch.");
                    }
                }
                await _eventHubClient.SendAsync(substationBatch);
            }

            // Process feeder telemetry
            if (feederTelemetry.Count > 0)
            {
                using var feederBatch = await _eventHubClient.CreateBatchAsync();
                foreach (var telemetry in feederTelemetry)
                {
                    var eventPayload = new EventData(
                        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(telemetry))
                    );
                    eventPayload.Properties["TelemetryType"] = "feeder";
                    if (!feederBatch.TryAdd(eventPayload))
                    {
                        _logger.LogWarning("⚠️ Feeder telemetry event too large to batch.");
                    }
                }
                await _eventHubClient.SendAsync(feederBatch);
            }

            // Handle alarms if present
            if (root.alarm?.al == 1)
            {
                string msg =
                    root.alarm.ev != null ? string.Join(", ", root.alarm.ev) : "Unknown alarm";
                await UpdateAlarmTwinAsync(root.Id, 1, msg);
                await InsertNotificationToSqlAsync(root.Id, msg);
            }

            // Update traffic statistics
            await UpdateTrafficStatsAsync(root.Id, body.Length);
        }
    }

    private List<Telemetry> ExtractSubstationTelemetry(TelemetryRoot root)
    {
        var telemetryList = new List<Telemetry>();

        foreach (var batch in root.batch ?? new List<Batch>())
        {
            DateTime timestamp = DateTimeOffset.FromUnixTimeSeconds(batch.ts).UtcDateTime;

            if (
                !string.IsNullOrEmpty(batch.t)
                || !string.IsNullOrEmpty(batch.ct)
                || !string.IsNullOrEmpty(batch.pt)
            )
            {
                telemetryList.Add(
                    new Telemetry
                    {
                        Timestamp = timestamp,
                        Identifier = root.Id,
                        Temperature = double.TryParse(batch.t, out var t1) ? t1 : null,
                        CoreTemperature = double.TryParse(batch.ct, out var ct1) ? ct1 : null,
                        PoleTilt = double.TryParse(batch.pt, out var pt1) ? pt1 : null,
                    }
                );
            }
        }

        return telemetryList;
    }

    private List<Telemetry> ExtractFeederTelemetry(TelemetryRoot root)
    {
        var telemetryList = new List<Telemetry>();

        foreach (var batch in root.batch ?? new List<Batch>())
        {
            DateTime timestamp = DateTimeOffset.FromUnixTimeSeconds(batch.ts).UtcDateTime;

            foreach (var sub in batch.sub ?? new List<Sub>())
            {
                foreach (var pqm in sub.pqm ?? new List<Pqm>())
                {
                    telemetryList.Add(
                        new Telemetry
                        {
                            Timestamp = timestamp,
                            Identifier = $"{root.Id}-{sub.feeder}",
                            Phase = "p" + pqm.ph,
                            Voltage = double.TryParse(pqm.v, out var v) ? v : null,
                            Frequency = double.TryParse(pqm.f, out var f) ? f : null,
                            VoltageTHD = double.TryParse(pqm.thdv, out var thdv) ? thdv : null,
                            Current = double.TryParse(pqm.i, out var i) ? i : null,
                            PFLoad = pqm.l == "i" ? 1 : -1,
                            PowerFactor = double.TryParse(pqm.pf, out var pf) ? pf : null,
                            CurrentTHD = double.TryParse(pqm.thdi, out var thdi) ? thdi : null,
                            ActivePower = double.TryParse(pqm.p, out var p) ? p : null,
                            ApparentPower = double.TryParse(pqm.s, out var s) ? s : null,
                            ReactivePower = double.TryParse(pqm.q, out var q) ? q : null,
                        }
                    );
                }
            }
        }

        return telemetryList;
    }

    private async Task UpdateDigitalTwinAsync(
        string deviceId,
        List<Telemetry> substationTelemetry,
        List<Telemetry> feederTelemetry
    )
    {
        // Update substation-related twin properties
        var substationPatch = new Azure.JsonPatchDocument();
        int substationOperationCount = 0;

        foreach (var telemetry in substationTelemetry)
        {
            substationPatch.AppendReplace(
                "/lastReading/CoreTemperature",
                telemetry.CoreTemperature ?? 0
            );
            substationPatch.AppendReplace("/lastReading/Temperature", telemetry.Temperature ?? 0);
            substationOperationCount++;
        }

        // Apply substation updates if there are any operations
        if (substationOperationCount > 0)
        {
            await _dtClient.UpdateDigitalTwinAsync(
                $"device-{deviceId}-substation",
                substationPatch
            );
        }

        // Update feeder-related twin properties
        var feederPatch = new Azure.JsonPatchDocument();
        int feederOperationCount = 0;

        foreach (var telemetry in feederTelemetry)
        {
            if (!string.IsNullOrEmpty(telemetry.Phase))
            {
                feederPatch.AppendReplace(
                    $"/lastReading/{telemetry.Phase}/Voltage",
                    telemetry.Voltage ?? 0
                );
                feederPatch.AppendReplace(
                    $"/lastReading/{telemetry.Phase}/Current",
                    telemetry.Current ?? 0
                );
                feederOperationCount++;
            }
        }

        // Apply feeder updates if there are any operations
        if (feederOperationCount > 0)
        {
            await _dtClient.UpdateDigitalTwinAsync($"device-{deviceId}-feeder", feederPatch);
        }
    }

    private async Task UpdateAlarmTwinAsync(string deviceId, int status, string message)
    {
        var twin = await _registryManager.GetTwinAsync(deviceId);
        var patch = new TwinCollection
        {
            ["alarmState"] = new TwinCollection { ["status"] = status, ["message"] = message },
        };
        await _registryManager.UpdateTwinAsync(deviceId, new Twin { Tags = patch }, twin.ETag);
    }

    private async Task InsertNotificationToSqlAsync(string deviceId, string message)
    {
        await _sqlConnection.OpenAsync();
        using var cmd = _sqlConnection.CreateCommand();
        cmd.CommandText =
            @"
            INSERT INTO Notifications (DeviceId, Message)
            SELECT DeviceId, @message FROM Devices WHERE GridWatchDeviceId = @gwid";
        cmd.Parameters.AddWithValue("@gwid", deviceId);
        cmd.Parameters.AddWithValue("@message", message);
        await cmd.ExecuteNonQueryAsync();
        await _sqlConnection.CloseAsync();
    }

    private async Task UpdateTrafficStatsAsync(string deviceId, int byteSize)
    {
        string date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        await _sqlConnection.OpenAsync();
        using var cmd = _sqlConnection.CreateCommand();
        cmd.CommandText =
            @"
            MERGE DeviceTraffic AS target
            USING (SELECT DeviceId FROM Devices WHERE GridWatchDeviceId = @gwid) AS source
            ON target.DeviceId = source.DeviceId AND target.Date = @date
            WHEN MATCHED THEN
                UPDATE SET BytesSent = BytesSent + @bytes, MessagesSent = MessagesSent + 1
            WHEN NOT MATCHED THEN
                INSERT (DeviceId, Date, BytesSent, MessagesSent)
                VALUES (source.DeviceId, @date, @bytes, 1);";
        cmd.Parameters.AddWithValue("@gwid", deviceId);
        cmd.Parameters.AddWithValue("@date", date);
        cmd.Parameters.AddWithValue("@bytes", byteSize);
        await cmd.ExecuteNonQueryAsync();
        await _sqlConnection.CloseAsync();
    }
}

// Supporting models for telemetry
public class TelemetryRoot
{
    public List<Batch>? batch;
    public string? id;
    public Alarm? alarm;
    public string Id => id ?? "unknown";
}

public class Batch
{
    public int ts;
    public string? t,
        ct,
        pt;
    public List<Sub>? sub;
}

public class Sub
{
    public int feeder;
    public List<Pqm>? pqm;
}

public class Pqm
{
    public string? ph,
        v,
        f,
        thdv,
        i,
        p,
        s,
        q,
        pf,
        l,
        thdi;
}

public class Alarm
{
    public int al;
    public List<object>? ev;
}

public class Telemetry
{
    public DateTime Timestamp;
    public string? Identifier,
        Phase;
    public double? Voltage,
        Frequency,
        Current,
        ActivePower,
        ApparentPower,
        PowerFactor,
        PFLoad,
        ReactivePower,
        VoltageTHD,
        CurrentTHD,
        Temperature,
        CoreTemperature,
        PoleTilt;
}
