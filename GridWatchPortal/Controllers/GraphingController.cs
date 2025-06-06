using GridWatchPortal.Dtos;
using GridWatchPortal.Dtos.Graphs;
using GridWatchPortal.Interfaces;
using GridWatchPortal.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchPortal.Controllers;
[ApiController]
[Route("api/graphing")]
[Authorize]
public class GraphingController : ControllerBase
{
    private readonly IGridWatchGraphService _graphService;

    public GraphingController(IGridWatchGraphService graphService)
    {
        _graphService = graphService;
    }

    [HttpPost("data")]
    public async Task<IActionResult> GetGraphData([FromBody] GraphQueryDto query)
    {
        if (string.IsNullOrWhiteSpace(query.SubstationId))
            return BadRequest("SubstationId is required.");

        var result = await _graphService.GetGraphDataAsync(query);
        return Ok(result);
    }
}
