namespace GridWatchPortal.Dtos
{
    public class DeviceDto
    {
        public string? DeviceId { get; set; }
        public string? ConnectionState { get; set; }
        public DateTimeOffset? LastActivityTime { get; set; }
    }
}
