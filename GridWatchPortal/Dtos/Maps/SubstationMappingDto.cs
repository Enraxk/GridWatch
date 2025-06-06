namespace GridWatchPortal.Dtos.Map
{
    public class SubstationMappingDto
    {
        public List<HeatmapLayer> Heatmaps { get; set; } = new();
        public List<SubstationDto> Substations { get; set; } = new();
    }

    public class HeatmapLayer
    {
        public string Name { get; set; } = string.Empty; // e.g., "High Voltage"
        public double Threshold { get; set; }
        public List<HeatmapPoint> Points { get; set; } = new();
    }

    public class HeatmapPoint
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Value { get; set; } // e.g., voltage reading
    }

    public class SubstationDto
    {
        public string SubstationId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Status { get; set; } = "Unknown";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int SignalStrength { get; set; } = 100;
        public List<FeederDto> Feeders { get; set; } = new();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    public class FeederDto
    {
        public string FeederId { get; set; } = string.Empty;
        public int CustomerCount { get; set; }
        public List<PhaseDto> Phases { get; set; } = new();
    }

    public class PhaseDto
    {
        public string PhaseName { get; set; } = "1";
        public double? Voltage { get; set; }
        public double? Current { get; set; }
        public double? ActivePower { get; set; }
        public double? PowerFactor { get; set; }
        public double ThD { get; set; } // Total Harmonic Distortion
        public DateTime LastUpdated { get; set; }
    }
}