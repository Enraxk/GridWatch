using System;

namespace GridWatchDeviceApi.Models
{
    public class DeviceEventsModel
    {
        public required string identifier { get; set; }
        public int overvoltageenable { get; set; }
        public int overcurrentenable { get; set; }
        public int undervoltageenable { get; set; }
        public int undercurrentenable { get; set; }
        public string? overvoltagetrigger { get; set; }
        public string? undervoltagetrigger { get; set; }
        public string? overcurrenttrigger { get; set; }
        public string? undercurrenttrigger { get; set; }

    }
}
