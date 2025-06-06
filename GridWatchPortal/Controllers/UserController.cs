using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GridWatchPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Ensure that only authenticated users can access these endpoints
    public class UserController : ControllerBase
    {
        // GET: api/user/profile
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            // Extract user information from the claims principal
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirstValue("name");
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            // Return user information as JSON
            return Ok(new
            {
                UserId = userId,
                UserName = userName,
                Email = userEmail
            });
        }

        // POST: api/user/logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Here you might perform any cleanup needed before signing out the user
            // For example, clearing cookies or invalidating tokens.

            return Ok(new { Message = "User has been logged out." });
        }
    }
}
