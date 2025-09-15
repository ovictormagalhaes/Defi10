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
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
        });
    }

    /// <summary>
    /// Root endpoint
    /// </summary>
    /// <returns>API information</returns>
    [HttpGet("")]
    public ActionResult GetRoot()
    {
        return Ok(new
        {
            name = "MyWebWallet API",
            version = "1.0.0",
            description = "Web3 Wallet API for DeFi portfolio management",
            endpoints = new
            {
                health = "/health",
                swagger = "/swagger",
                wallets = "/api/v1/wallets",
                tokens = "/api/v1/tokens",
                cache = "/api/v1/cache"
            },
            timestamp = DateTime.UtcNow
        });
    }
}