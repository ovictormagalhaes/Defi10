using Microsoft.AspNetCore.Mvc;

namespace MyWebWallet.API.Controllers;

[ApiController]
[Route("")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint for monitoring and deployment services
    /// </summary>
    /// <returns>Health status</returns>
    [HttpGet("health")]
    public ActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            application = "Defi10 API"
        });
    }
}