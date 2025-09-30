using Microsoft.AspNetCore.Mvc;
using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;

namespace MyWebWallet.API.Controllers;

[ApiController]
[Route("api/v1/wallets")]
public class WalletController : ControllerBase
{
    //private readonly IWalletService _walletService;

    public WalletController()
    {

    }

    /// <summary>
    /// Gets supported chains for wallet operations
    /// </summary>
    /// <returns>List of supported blockchain networks with metadata</returns>
    [HttpGet("supported-chains")]
    public ActionResult<SupportedChainsResponse> GetSupportedChains()
    {
        var supportedChains = new List<SupportedChainResponse>
        {
            new()
            {
                Name = "Base",
                Id = Chain.Base.ToChainId(),
                ChainId = Chain.Base.ToNumericChainId(),
                DisplayName = Chain.Base.GetDisplayName(),
                IconUrl = Chain.Base.GetIconUrl()
            },
            new()
            {
                Name = "BNB",
                Id = Chain.BNB.ToChainId(),
                ChainId = Chain.BNB.ToNumericChainId(),
                DisplayName = Chain.BNB.GetDisplayName(),
                IconUrl = Chain.BNB.GetIconUrl()
            },
            new()
            {
                Name = "Arbitrum",
                Id = Chain.Arbitrum.ToChainId(),
                ChainId = Chain.Arbitrum.ToNumericChainId(),
                DisplayName = Chain.Arbitrum.GetDisplayName(),
                IconUrl = Chain.Arbitrum.GetIconUrl()
            }
        };

        var response = new SupportedChainsResponse
        {
            Chains = supportedChains
        };

        return Ok(response);
    }
}