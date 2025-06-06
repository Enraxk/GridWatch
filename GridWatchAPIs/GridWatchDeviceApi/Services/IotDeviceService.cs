using System.Text;
using Azure.Identity;
using GridWatchDeviceApi.Models;
using GridWatchDeviceApi.Services.Entities;
using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Common.Exceptions;
using Newtonsoft.Json;

namespace GridWatchDeviceApi.Services;

public interface IIotDeviceService
{
    Task<IEnumerable<EntityDevice?>> GetAllDevicesAsync();
    Task<IEnumerable<EntityDevice?>> GetDevicesByConnectionStateAsync(string connectionState);
    Task<EntityDevice?> GetDeviceAsync(string deviceId);
    Task<EntityDevice?> GetDevice(string deviceId);
    Task<DeviceTags?> GetDeviceTags(string deviceId);
    Task UpdateDesiredPropertiesAsync(string deviceId, DesiredProperties model);
    Task<ReportedProperties?> GetReportedPropertiesAsync(string deviceId);
    Task<DesiredProperties?> GetDesiredPropertiesAsync(string deviceId);
    Task<CloudToDeviceMethodResult?> CallDirectMethodAsync(DirectMethod method);
}

public class IotDeviceService : IIotDeviceService, IDisposable
{
    private readonly RegistryManager _registryManager;
    private readonly ServiceClient _serviceClient;
    private readonly StringBuilder _queryBuilder = new();

    public IotDeviceService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (environment.IsDevelopment())
        {
            // ✅ Use IoT Hub connection string in Development
            Console.WriteLine("⚙️ Running Locally: Using Connection String for IoT Hub.");
            string iotHubConnectionString =
                configuration["ApplicationSettings:IoTHubConnectionString"]
                ?? throw new Exception(
                    "❌ IoT Hub connection string missing from appsettings.json!"
                );

            _registryManager = RegistryManager.CreateFromConnectionString(iotHubConnectionString);
            _serviceClient = ServiceClient.CreateFromConnectionString(iotHubConnectionString);
        }
        else
        {
            // ✅ Use Managed Identity authentication in Production
            Console.WriteLine("🔐 Running in Azure: Using Managed Identity for IoT Hub.");

            string iotHubHost =
                configuration["ApplicationSettings:IoTHubHost"]
                ?? throw new Exception("❌ IoT Hub hostname missing from configuration!");

            _registryManager = RegistryManager.Create(iotHubHost, new DefaultAzureCredential());
            _serviceClient = ServiceClient.Create(iotHubHost, new DefaultAzureCredential());
        }
    }

    public async Task<IEnumerable<EntityDevice?>> GetAllDevicesAsync()
    {
        _queryBuilder.Clear();
        _queryBuilder.Append("SELECT * FROM devices WHERE status = 'enabled'");

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = await query.GetNextAsJsonAsync();

        return deviceJsons.Select(JsonConvert.DeserializeObject<EntityDevice>);
    }

    public async Task<IEnumerable<EntityDevice?>> GetDevicesByConnectionStateAsync(
        string connectionState
    )
    {
        _queryBuilder.Clear();
        _queryBuilder.Append(
            $"SELECT * FROM devices WHERE status = 'enabled' AND connectionState = '{connectionState}'"
        );

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = await query.GetNextAsJsonAsync();

        return deviceJsons.Select(JsonConvert.DeserializeObject<EntityDevice>);
    }

    public async Task<EntityDevice?> GetDeviceAsync(string deviceId)
    {
        _queryBuilder.Clear();
        _queryBuilder.Append($"SELECT * FROM devices WHERE deviceId = '{deviceId}'");

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = await query.GetNextAsJsonAsync();

        return deviceJsons.Select(JsonConvert.DeserializeObject<EntityDevice>).FirstOrDefault();
    }

    public async Task<EntityDevice?> GetDevice(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        _queryBuilder.Clear();
        _queryBuilder.Append($"SELECT * FROM devices WHERE deviceId = '{deviceId}'");

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = (await query.GetNextAsJsonAsync()).ToList();

        return deviceJsons.Any()
            ? JsonConvert.DeserializeObject<EntityDevice>(deviceJsons.First())
            : null;
    }

    public async Task<DeviceTags?> GetDeviceTags(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        _queryBuilder.Clear();
        _queryBuilder.Append($"SELECT tags FROM devices WHERE deviceId = '{deviceId}'");

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = (await query.GetNextAsJsonAsync()).ToList();

        return deviceJsons.Any()
            ? JsonConvert.DeserializeObject<DeviceTags>(deviceJsons.First())
            : null;
    }

    public void Dispose()
    {
        _registryManager?.Dispose();
        _serviceClient?.Dispose();
    }

    public async Task UpdateDesiredPropertiesAsync(string deviceId, DesiredProperties model)
    {
        if (string.IsNullOrEmpty(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        if (model == null)
            throw new ArgumentNullException(
                nameof(model),
                "Desired properties update model cannot be null."
            );

        try
        {
            // 🔍 Fetch the existing twin
            var twin = await _registryManager.GetTwinAsync(deviceId);
            if (twin == null)
                throw new Exception($"Device {deviceId} not found.");

            // 🏗 Create a dictionary to store the updated desired properties
            var updatedProperties = new Dictionary<string, object>();

            // ✅ Update **Telemetry**
            if (model.Telemetry != null)
            {
                var updatedTelemetry = new Dictionary<string, object>();

                if (model.Telemetry.Vsource.HasValue)
                    updatedTelemetry["vsource"] = model.Telemetry.Vsource.Value;
                if (model.Telemetry.PhMask.HasValue)
                    updatedTelemetry["phmask"] = model.Telemetry.PhMask.Value;
                if (model.Telemetry.Timeout.HasValue)
                    updatedTelemetry["timeout"] = model.Telemetry.Timeout.Value;
                if (!string.IsNullOrEmpty(model.Telemetry.Interval))
                    updatedTelemetry["interval"] = model.Telemetry.Interval;
                if (model.Telemetry.Batch.HasValue)
                    updatedTelemetry["batch"] = model.Telemetry.Batch.Value;
                if (model.Telemetry.Precision.HasValue)
                    updatedTelemetry["precision"] = model.Telemetry.Precision.Value;
                if (model.Telemetry.Current.HasValue)
                    updatedTelemetry["current"] = model.Telemetry.Current.Value;
                if (model.Telemetry.Voltage.HasValue)
                    updatedTelemetry["voltage"] = model.Telemetry.Voltage.Value;
                if (model.Telemetry.Frequency.HasValue)
                    updatedTelemetry["frequency"] = model.Telemetry.Frequency.Value;
                if (model.Telemetry.Power.HasValue)
                    updatedTelemetry["power"] = model.Telemetry.Power.Value;
                if (model.Telemetry.Harmonics.HasValue)
                    updatedTelemetry["harmonics"] = model.Telemetry.Harmonics.Value;
                if (model.Telemetry.Temperature.HasValue)
                    updatedTelemetry["temperature"] = model.Telemetry.Temperature.Value;

                if (updatedTelemetry.Any())
                    updatedProperties["telemetry"] = updatedTelemetry;
            }

            // ✅ Update **Events**
            // ✅ Update **Events**
            if (model.Events != null)
            {
                var updatedEvents = new Dictionary<string, object>();

                if (model.Events.MainsLost != null)
                    updatedEvents["ml"] = model.Events.MainsLost;
                if (model.Events.MainsReturned != null)
                    updatedEvents["mr"] = model.Events.MainsReturned;

                // ✅ Handle OverVoltage with "level"
                if (model.Events.OverVoltage != null)
                {
                    var updatedOv = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.OverVoltage.Id,
                        ["enable"] = model.Events.OverVoltage.Enable,
                    };

                    if (model.Events.OverVoltage.Level.HasValue)
                        updatedOv["level"] = model.Events.OverVoltage.Level.Value;

                    updatedEvents["ov"] = updatedOv;
                }

                // ✅ Handle OverCurrent with "level"
                if (model.Events.OverCurrent != null)
                {
                    var updatedOc = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.OverCurrent.Id,
                        ["enable"] = model.Events.OverCurrent.Enable,
                    };

                    if (model.Events.OverCurrent.Level.HasValue)
                        updatedOc["level"] = model.Events.OverCurrent.Level.Value;

                    updatedEvents["oc"] = updatedOc;
                }

                // ✅ Handle UnderVoltage with "level"
                if (model.Events.UnderVoltage != null)
                {
                    var updatedUv = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.UnderVoltage.Id,
                        ["enable"] = model.Events.UnderVoltage.Enable,
                    };

                    if (model.Events.UnderVoltage.Level.HasValue)
                        updatedUv["level"] = model.Events.UnderVoltage.Level.Value;

                    updatedEvents["uv"] = updatedUv;
                }

                // ✅ Handle UnderCurrent with "level"
                if (model.Events.UnderCurrent != null)
                {
                    var updatedUc = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.UnderCurrent.Id,
                        ["enable"] = model.Events.UnderCurrent.Enable,
                    };

                    if (model.Events.UnderCurrent.Level.HasValue)
                        updatedUc["level"] = model.Events.UnderCurrent.Level.Value;

                    updatedEvents["uc"] = updatedUc;
                }

                // ✅ Handle Sag with "level" and "cyc"
                if (model.Events.Sag != null)
                {
                    var updatedSag = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.Sag.Id,
                        ["enable"] = model.Events.Sag.Enable,
                    };

                    if (model.Events.Sag.Level.HasValue)
                        updatedSag["level"] = model.Events.Sag.Level.Value;
                    if (model.Events.Sag.Cycle.HasValue)
                        updatedSag["cyc"] = model.Events.Sag.Cycle.Value;

                    updatedEvents["sag"] = updatedSag;
                }

                // ✅ Handle PeakVoltage with "level" and "cyc"
                if (model.Events.PeakVoltage != null)
                {
                    var updatedPkv = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.PeakVoltage.Id,
                        ["enable"] = model.Events.PeakVoltage.Enable,
                    };

                    if (model.Events.PeakVoltage.Level.HasValue)
                        updatedPkv["level"] = model.Events.PeakVoltage.Level.Value;
                    if (model.Events.PeakVoltage.Cycle.HasValue)
                        updatedPkv["cyc"] = model.Events.PeakVoltage.Cycle.Value;

                    updatedEvents["pkv"] = updatedPkv;
                }

                // ✅ Handle PeakCurrent with "level" and "cyc"
                if (model.Events.PeakCurrent != null)
                {
                    var updatedPki = new Dictionary<string, object>
                    {
                        ["id"] = model.Events.PeakCurrent.Id,
                        ["enable"] = model.Events.PeakCurrent.Enable,
                    };

                    if (model.Events.PeakCurrent.Level.HasValue)
                        updatedPki["level"] = model.Events.PeakCurrent.Level.Value;
                    if (model.Events.PeakCurrent.Cycle.HasValue)
                        updatedPki["cyc"] = model.Events.PeakCurrent.Cycle.Value;

                    updatedEvents["pki"] = updatedPki;
                }

                if (updatedEvents.Any())
                    updatedProperties["events"] = updatedEvents;
            }

            // ✅ Update **EventWindow**
            if (model.EventWindow != null)
            {
                var updatedEventWindow = new Dictionary<string, object>();

                if (model.EventWindow.Count.HasValue)
                    updatedEventWindow["count"] = model.EventWindow.Count.Value;
                if (!string.IsNullOrEmpty(model.EventWindow.Interval))
                    updatedEventWindow["interval"] = model.EventWindow.Interval;

                if (updatedEventWindow.Any())
                    updatedProperties["eventwindow"] = updatedEventWindow;
            }

            // ✅ Update **WiFi Access Point (wifiap)**
            if (model.WifiAccessPoint != null)
            {
                var updatedWifiAp = new Dictionary<string, object>();

                if (!string.IsNullOrEmpty(model.WifiAccessPoint.Ssid))
                    updatedWifiAp["ssid"] = model.WifiAccessPoint.Ssid;
                if (model.WifiAccessPoint.Channel.HasValue)
                    updatedWifiAp["channel"] = model.WifiAccessPoint.Channel.Value;
                if (!string.IsNullOrEmpty(model.WifiAccessPoint.Password))
                    updatedWifiAp["pass"] = model.WifiAccessPoint.Password;
                if (model.WifiAccessPoint.Timeout.HasValue)
                    updatedWifiAp["timeout"] = model.WifiAccessPoint.Timeout.Value;

                if (updatedWifiAp.Any())
                    updatedProperties["wifiap"] = updatedWifiAp;
            }

            // ✅ Update **WiFi Station (wifista)**
            if (model.WifiStation != null)
            {
                var updatedWifiSta = new Dictionary<string, object>();

                if (!string.IsNullOrEmpty(model.WifiStation.Ssid))
                    updatedWifiSta["ssid"] = model.WifiStation.Ssid;
                if (!string.IsNullOrEmpty(model.WifiStation.Password))
                    updatedWifiSta["pass"] = model.WifiStation.Password;

                if (updatedWifiSta.Any())
                    updatedProperties["wifista"] = updatedWifiSta;
            }

            // ✅ Update **Settings**
            if (model.Settings != null)
            {
                var updatedSettings = new Dictionary<string, object>();

                if (model.Settings.PowerMode.HasValue)
                    updatedSettings["powermode"] = model.Settings.PowerMode.Value;
                if (!string.IsNullOrEmpty(model.Settings.PacketVersion))
                    updatedSettings["packetversion"] = model.Settings.PacketVersion;
                if (!string.IsNullOrEmpty(model.Settings.Transport))
                    updatedSettings["transport"] = model.Settings.Transport;
                if (model.Settings.MessagePack.HasValue)
                    updatedSettings["messagepack"] = model.Settings.MessagePack.Value;

                if (updatedSettings.Any())
                    updatedProperties["settings"] = updatedSettings;
            }

            // ❌ If no fields are updated, return early
            if (!updatedProperties.Any())
            {
                Console.WriteLine(
                    $"⚠️ No updates were made for {deviceId}. No valid properties found."
                );
                return;
            }

            // 📝 Patch the twin with only the updated fields
            var patch = new { properties = new { desired = updatedProperties } };
            var patchJson = JsonConvert.SerializeObject(patch);

            // 🔄 Update the twin in IoT Hub
            await _registryManager.UpdateTwinAsync(deviceId, patchJson, twin.ETag);

            Console.WriteLine($"✅ Successfully updated desired properties for {deviceId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"❌ Failed to update desired properties for {deviceId}: {ex.Message}"
            );
            throw;
        }
    }
    public async Task<ReportedProperties?> GetReportedPropertiesAsync(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        _queryBuilder.Clear();
        _queryBuilder.Append(
            $"SELECT connectionState, properties.reported FROM devices WHERE deviceId = '{deviceId}'"
        );

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = (await query.GetNextAsJsonAsync()).ToList();

        return deviceJsons.Any()
            ? JsonConvert.DeserializeObject<ReportedProperties>(deviceJsons.First())
            : null;
    }

    public async Task<DesiredProperties?> GetDesiredPropertiesAsync(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
            throw new ArgumentException("Device ID cannot be null or empty", nameof(deviceId));

        _queryBuilder.Clear();
        _queryBuilder.Append(
            $"SELECT connectionState, properties.desired FROM devices WHERE deviceId = '{deviceId}'"
        );

        var query = _registryManager.CreateQuery(_queryBuilder.ToString());
        var deviceJsons = (await query.GetNextAsJsonAsync()).ToList();

        return deviceJsons.Any()
            ? JsonConvert.DeserializeObject<DesiredProperties>(deviceJsons.First())
            : null;
    }

    public async Task<CloudToDeviceMethodResult?> CallDirectMethodAsync(DirectMethod method)
    {
        if (method == null)
            throw new ArgumentNullException(nameof(method));

        try
        {
            var commandInvocation = new CloudToDeviceMethod(method.Method)
            {
                ResponseTimeout = TimeSpan.FromSeconds(30),
            };

            if (!string.IsNullOrEmpty(method.Payload))
            {
                commandInvocation.SetPayloadJson(method.Payload);
            }

            return await _serviceClient.InvokeDeviceMethodAsync(method.DeviceId, commandInvocation);
        }
        catch (DeviceNotFoundException ex)
        {
            Console.WriteLine($"⚠️ Device {method.DeviceId} not found: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error invoking direct method: {ex.Message}");
            return null;
        }
    }
}
