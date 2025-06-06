namespace GridWatchPortal.Dtos.Graphs
{
    public class GraphPointDto
    {
        public DateTime Timestamp { get; set; }
        public double Value { get; set; }
    }

    public class GraphSeriesDto
    {
        public string GraphType { get; set; } = string.Empty;
        public string SeriesName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string FeederId { get; set; } = "Feeder 1"; // NEW FIELD
        public string DeviceId { get; set; } = string.Empty;
        public List<GraphPointDto> DataPoints { get; set; } = new();
    }

    public class GraphDataResponseDto
    {
        public string SubstationId { get; set; } = string.Empty;
        public bool Grouped { get; set; }
        public string TimeScale { get; set; } = "day";
        public List<GraphSeriesDto> Series { get; set; } = new();
    }
}
