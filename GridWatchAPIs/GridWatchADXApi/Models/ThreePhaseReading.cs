using System;

namespace GridWatchAdxApi.Models
{
    public class ThreePhaseReading
    {
        public DateTime Timestamp { get; set; }
        public double? Phase1 { get; set; }
        public double? Phase2 { get; set; }
        public double? Phase3 { get; set; }
    }
}