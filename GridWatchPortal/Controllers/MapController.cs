using GridWatchPortal.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchPortal.Controllers;

[ApiController]
[Route("api/gridwatch/maps")]
[Authorize]
public class MapController : ControllerBase
{
    private readonly IMapService _mapService;

    public MapController(IMapService mapService)
    {
        _mapService = mapService;
    }

    [HttpGet("substations")]
    public async Task<IActionResult> GetSubstationMappings()
    {
        var result = await _mapService.GetSubstationMappingsAsync();
        return Ok(result);
    }
}
