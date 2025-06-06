namespace GridWatchPortal.Dtos.Graphs
{
    public class GraphQueryDto
    {
        public string SubstationId { get; set; } = string.Empty;
        public List<string> GraphTypes { get; set; } = new();
        public string Scale { get; set; } = "day"; // "day", "week", "custom"
        public bool GroupGraphs { get; set; } = false;
        public DateTime? CustomFrom { get; set; }
        public DateTime? CustomTo { get; set; }
        public List<string>? DeviceIds { get; set; } // ✅ Add this
        public bool MultiDeviceMode { get; set; }
        public string DeviceId { get; set; } = string.Empty;
    }
}
