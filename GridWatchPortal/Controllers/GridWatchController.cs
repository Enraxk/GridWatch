using GridWatchPortal.Dtos;
using GridWatchPortal.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchPortal.Controllers;

[ApiController]
[Route("api/gridwatch")]
[Authorize]
public class GridWatchController : ControllerBase
{
    private readonly IGridWatchService _gridWatchService;

    public GridWatchController(IGridWatchService gridWatchService)
    {
        _gridWatchService = gridWatchService;
    }

    [HttpGet("devices/connected")]
    public async Task<IActionResult> GetConnectedDevices()
    {
        var devices = await _gridWatchService.GetConnectedDevicesAsync();
        return Ok(devices);
    }

    [HttpGet("substation/voltages")]
    public async Task<IActionResult> GetSubstationVoltages(
        [FromQuery] string substationId,
        [FromQuery] DateTime startTime,
        [FromQuery] DateTime endTime
    )
    {
        if (string.IsNullOrEmpty(substationId))
            return BadRequest("Substation ID is required.");

        var voltages = await _gridWatchService.GetSubstationVoltagesAsync(
            substationId,
            startTime,
            endTime
        );
        return Ok(voltages);
    }
}
