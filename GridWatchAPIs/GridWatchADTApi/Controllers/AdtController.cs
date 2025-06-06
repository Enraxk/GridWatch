using System.Threading.Tasks;
using GridWatchAdtApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchAdtApi.Controllers
{
    [ApiController]
    [Route("api/adt")]
    public class AdtController : ControllerBase
    {
        private readonly IAdtService _adtService;

        public AdtController(IAdtService adtService)
        {
            _adtService = adtService;
        }

        /// <summary>
        /// Gets a digital twin by ID.
        /// </summary>
        [HttpGet("twin/{twinId}")]
        [Authorize("RequireAAD")] // Optional
        public async Task<IActionResult> GetTwin(string twinId)
        {
            var result = await _adtService.GetTwinAsync(twinId);
            return Ok(result);
        }

        /// <summary>
        /// Executes a query against the ADT instance.
        /// </summary>
        [HttpPost("query")]
        [Authorize("RequireAAD")] // Optional
        public async Task<IActionResult> Query([FromBody] string query)
        {
            var result = await _adtService.QueryTwinsAsync(query);
            return Ok(result);
        }
    }
}
