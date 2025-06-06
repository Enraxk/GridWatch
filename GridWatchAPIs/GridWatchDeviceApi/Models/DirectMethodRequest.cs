using Newtonsoft.Json;

namespace GridWatchDeviceApi.Models
{
    /// <summary>
    /// Represents the request payload for invoking a direct method on an IoT device. DTO Data Transfer Object
    /// </summary>
    public class DirectMethodRequest
    {
        /// <summary>
        /// The name of the method to invoke on the device.
        /// </summary>
        [JsonProperty("method")]
        public required string Method { get; set; }

        /// <summary>
        /// The JSON payload to send with the direct method invocation.
        /// </summary>
        [JsonProperty("payload")]
        public string? Payload { get; set; }
    }
}
