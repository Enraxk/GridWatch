using GridWatchAdxApi.Models;
using GridWatchAdxApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchAdxApi.Controllers
{
    [ApiController]
    [Route("api/adx")]
    public class AdxController : ControllerBase
    {
        private readonly IAdxQueryService _adxService;

        public AdxController(IAdxQueryService adxService)
        {
            _adxService = adxService;
        }

        /// <summary>
        /// Get three-phase voltage readings for a substation between start and end time.
        /// </summary>
        /// <param name="substationId">The substation identifier</param>
        /// <param name="start">Start time in ISO 8601 format</param>
        /// <param name="end">End time in ISO 8601 format</param>
        [HttpGet("substation/voltages")]
        public async Task<IActionResult> GetSubstationVoltages(
            [FromQuery] string substationId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            if (string.IsNullOrWhiteSpace(substationId))
                return BadRequest("substationId is required.");

            var readings = await _adxService.GetSubstationVoltagesAsync(substationId, start, end);
            return Ok(readings);
        }
    }
}
