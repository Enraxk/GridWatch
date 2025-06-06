using System;

namespace GridWatchDeviceApi.Models
{
    public class DeviceTelemetryModel
    {
        public required string identifier { get; set; }
        public int individual { get; set; }
        public int voltage { get; set; }
        public int current { get; set; }
        public int power { get; set; }
        public int frequency { get; set; }
        public int harmonics { get; set; }
        public int interval { get; set; }
        public int batch { get; set; }

    }
}
