using GridWatchPortal.Dtos.Map;

namespace GridWatchPortal.Interfaces
{
    public interface IMapService
    {
        Task<SubstationMappingDto> GetSubstationMappingsAsync();
    }
}
