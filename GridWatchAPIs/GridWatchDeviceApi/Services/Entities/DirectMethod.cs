using System;

namespace GridWatchDeviceApi.Services.Entities
{
    public class DirectMethod
    {
        public required string DeviceId { get; set; }
        public required string Method { get; set; }
        public required string Payload { get; set; }
    }
}
