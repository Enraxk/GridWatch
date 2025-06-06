using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace GridWatchDeviceApi.Services.Entities
{
    /// <summary>
    /// Represents an IoT Device Twin entity.
    /// </summary>
    public class EntityDevice
    {
        // ✅ Device Identifiers
        [JsonProperty("deviceId")]
        public required string DeviceId { get; set; }

        [JsonProperty("deviceEtag")]
        public string? DeviceEtag { get; set; }

        [JsonProperty("etag")]
        public string? Etag { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }

        // ✅ Device Connection & Status
        [JsonProperty("status")]
        public string? Status { get; set; }

        [JsonProperty("statusUpdateTime")]
        public DateTime StatusUpdateTime { get; set; }

        [JsonProperty("connectionState")]
        public string? ConnectionState { get; set; }

        [JsonProperty("lastActivityTime")]
        public DateTimeOffset LastActivityTime { get; set; }

        [JsonProperty("cloudToDeviceMessageCount")]
        public int CloudToDeviceMessageCount { get; set; }

        [JsonProperty("authenticationType")]
        public string? AuthenticationType { get; set; }

        [JsonProperty("modelId")]
        public string? ModelId { get; set; }

        // ✅ Device Capabilities (Edge Device Support)
        [JsonProperty("capabilities")]
        public Capabilities? Capabilities { get; set; }

        // ✅ Device Security Information
        [JsonProperty("x509Thumbprint")]
        public X509Thumbprint? X509Thumbprint { get; set; }

        // ✅ Tags (Metadata Assigned to the Device)
        [JsonProperty("tags")]
        public DeviceTags? Tags { get; set; }

        // ✅ Properties (Desired & Reported Properties)
        [JsonProperty("properties")]
        public DeviceProperties? Properties { get; set; }
    }

    public class Capabilities
    {
        [JsonProperty("iotEdge")]
        public bool IotEdge { get; set; }
    }

    public class X509Thumbprint
    {
        [JsonProperty("PrimaryThumbprint")]
        public string? PrimaryThumbprint { get; set; }

        [JsonProperty("SecondaryThumbprint")]
        public string? SecondaryThumbprint { get; set; }
    }

    public class DeviceTags
    {
        [JsonProperty("alarmState")]
        public AlarmState? AlarmState { get; set; }

        [JsonProperty("deviceModel")]
        public string? DeviceModel { get; set; }
    }

    public class AlarmState
    {
        [JsonProperty("message")]
        public string? Message { get; set; }

        [JsonProperty("status")]
        public int Status { get; set; }
    }

    /// <summary>
    /// Represents desired and reported properties of the device twin.
    /// </summary>
    public class DeviceProperties
    {
        [JsonProperty("desired")]
        public DesiredProperties? Desired { get; set; }

        [JsonProperty("reported")]
        public ReportedProperties? Reported { get; set; }
    }

    // ✅ Desired Properties
    public class DesiredProperties
    {
        [JsonProperty("$version")]
        public int Version { get; set; }

        [JsonProperty("wifiap")]
        public WifiAccessPoint? WifiAccessPoint { get; set; }

        [JsonProperty("wifista")]
        public WifiStation? WifiStation { get; set; }

        [JsonProperty("telemetry")]
        public Telemetry? Telemetry { get; set; }

        [JsonProperty("events")]
        public Events? Events { get; set; }

        [JsonProperty("eventwindow")]
        public EventWindow? EventWindow { get; set; }

        [JsonProperty("settings")]
        public Settings? Settings { get; set; }
    }

    public class WifiAccessPoint
    {
        [JsonProperty("ssid")]
        public string? Ssid { get; set; }

        [JsonProperty("channel")]
        public int? Channel { get; set; }

        [JsonProperty("pass")]
        public string? Password { get; set; }

        [JsonProperty("timeout")]
        public int? Timeout { get; set; }
    }

    public class WifiStation
    {
        [JsonProperty("ssid")]
        public required string Ssid { get; set; }

        [JsonProperty("pass")]
        public required string Password { get; set; }
    }

    public class Settings
    {
        [JsonProperty("powermode")]
        public int? PowerMode { get; set; }

        [JsonProperty("packetversion")]
        public string? PacketVersion { get; set; }

        [JsonProperty("transport")]
        public string? Transport { get; set; }

        [JsonProperty("messagepack")]
        public int? MessagePack { get; set; }
    }

    // ✅ Reported Properties
    public class ReportedProperties
    {
        [JsonProperty("$version")]
        public int Version { get; set; }

        [JsonProperty("telemetry")]
        public Telemetry? Telemetry { get; set; }

        [JsonProperty("events")]
        public Events? Events { get; set; }

        [JsonProperty("eventwindow")]
        public EventWindow? EventWindow { get; set; }

        [JsonProperty("gsm")]
        public Gsm? Gsm { get; set; }

        [JsonProperty("info")]
        public DeviceInfo? Info { get; set; }

        [JsonProperty("security")]
        public Security? Security { get; set; }

        [JsonProperty("substation")]
        public Substation? Substation { get; set; }
    }

    public class Telemetry
    {
        [JsonProperty("vsource")]
        public int? Vsource { get; set; }

        [JsonProperty("phmask")]
        public int? PhMask { get; set; }

        [JsonProperty("timeout")]
        public int? Timeout { get; set; }

        [JsonProperty("interval")]
        public string? Interval { get; set; }

        [JsonProperty("batch")]
        public int? Batch { get; set; }

        [JsonProperty("precision")]
        public int? Precision { get; set; }

        [JsonProperty("current")]
        public int? Current { get; set; }

        [JsonProperty("voltage")]
        public int? Voltage { get; set; }

        [JsonProperty("frequency")]
        public int? Frequency { get; set; }

        [JsonProperty("power")]
        public int? Power { get; set; }

        [JsonProperty("harmonics")]
        public int? Harmonics { get; set; }

        [JsonProperty("temperature")]
        public int? Temperature { get; set; }
    }

    public class Events
    {
        [JsonProperty("ml")]
        public EventBase? MainsLost { get; set; }

        [JsonProperty("mr")]
        public EventBase? MainsReturned { get; set; }

        [JsonProperty("ov")]
        public EventWithLevel? OverVoltage { get; set; }

        [JsonProperty("oc")]
        public EventWithLevel? OverCurrent { get; set; }

        [JsonProperty("uv")]
        public EventWithLevel? UnderVoltage { get; set; }

        [JsonProperty("uc")]
        public EventWithLevel? UnderCurrent { get; set; }

        [JsonProperty("sag")]
        public EventWithLevelAndCycle? Sag { get; set; }

        [JsonProperty("pkv")]
        public EventWithLevelAndCycle? PeakVoltage { get; set; }

        [JsonProperty("pki")]
        public EventWithLevelAndCycle? PeakCurrent { get; set; }

        [JsonProperty("pkt")]
        public EventWithLevel? PacketThreshold { get; set; }

        [JsonProperty("cot")]
        public EventWithLevel? CutoffThreshold { get; set; }
    }

    public class EventBase
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("enable")]
        public int Enable { get; set; }
    }

    public class EventWithLevel : EventBase
    {
        [JsonProperty("level")]
        public double? Level { get; set; }
    }

    public class EventWithLevelAndCycle : EventWithLevel
    {
        [JsonProperty("cyc")]
        public int? Cycle { get; set; }
    }

    public class EventWindow
    {
        [JsonProperty("count")]
        public int? Count { get; set; }

        [JsonProperty("interval")]
        public string? Interval { get; set; }
    }

    public class Gsm
    {
        [JsonProperty("apn")]
        public string? Apn { get; set; }

        [JsonProperty("iccid")]
        public string? Iccid { get; set; }

        [JsonProperty("rssi")]
        public int Rssi { get; set; }
    }

    public class DeviceInfo
    {
        [JsonProperty("bootreason")]
        public string? BootReason { get; set; }

        [JsonProperty("firmware")]
        public string? Firmware { get; set; }

        [JsonProperty("lastboot")]
        public string? LastBoot { get; set; }

        [JsonProperty("sdk")]
        public string? Sdk { get; set; }

        [JsonProperty("wifistatus")]
        public int WifiStatus { get; set; }
    }

    public class Security
    {
        [JsonProperty("certbit")]
        public string? CertBit { get; set; }

        [JsonProperty("certexpire")]
        public string? CertExpire { get; set; }
    }

    public class Substation
    {
        [JsonProperty("id")]
        public string? Id { get; set; }

        [JsonProperty("lat")]
        public string? Latitude { get; set; }

        [JsonProperty("lon")]
        public string? Longitude { get; set; }

        [JsonProperty("name")]
        public string? Name { get; set; }

        [JsonProperty("type")]
        public string? Type { get; set; }
    }
}
