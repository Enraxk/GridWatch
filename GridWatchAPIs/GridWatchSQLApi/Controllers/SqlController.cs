using GridWatchSqlApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GridWatchSqlApi.Controllers
{
    [ApiController]
    [Route("api/sql")]
    public class SqlController : ControllerBase
    {
        private readonly ISqlQueryService _sqlService;

        public SqlController(ISqlQueryService sqlService)
        {
            _sqlService = sqlService;
        }

        [HttpPost("query")]
        [Authorize("RequireAAD")]
        public async Task<IActionResult> Query([FromBody] string sql)
        {
            if (string.IsNullOrWhiteSpace(sql))
                return BadRequest("SQL query is required.");

            var result = await _sqlService.ExecuteQueryAsync(sql);
            return Ok(result);
        }
    }
}
