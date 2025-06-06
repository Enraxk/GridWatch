using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GridWatchPortal.Dtos; // Ensure this matches your DTO namespace

namespace GridWatchPortal.Interfaces
{
    public interface IGridWatchService
    {
        Task<IEnumerable<object>> GetConnectedDevicesAsync();

        Task<IEnumerable<ThreePhaseReadingDto>> GetSubstationVoltagesAsync(
            string substationId,
            DateTime startTime,
            DateTime endTime
        );
    }
}
