using Microsoft.AspNetCore.Mvc;
using MyWebWallet.API.Services.Interfaces;
using MyWebWallet.API.DTOs;

namespace MyWebWallet.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ProtocolsController : ControllerBase
    {
        private readonly IProtocolStatusService _protocolStatusService;
        private readonly ILogger<ProtocolsController> _logger;

        public ProtocolsController(
            IProtocolStatusService protocolStatusService,
            ILogger<ProtocolsController> logger)
        { 
            _protocolStatusService = protocolStatusService;
            _logger = logger; 
        }

        [HttpGet("status")]
        [ProducesResponseType(typeof(ProtocolStatusListResponse), 200)]
        public ActionResult<ProtocolStatusListResponse> GetProtocolStatus()
        {
            try
            {
                var result = _protocolStatusService.GetProtocolStatus();
                _logger.LogInformation("Protocol status retrieved - Protocols: {Count}", result.Protocols.Count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving protocol status");
                return StatusCode(500, new { error = "Failed to retrieve protocol status" });
            }
        }
    }
}