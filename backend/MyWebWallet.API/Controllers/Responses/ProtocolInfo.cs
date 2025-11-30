using MyWebWallet.API.Models;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Controllers.Responses;

public class ProtocolInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public List<ChainEnum> SupportedChains { get; set; } = new();
    public List<WalletItemType> SupportedPositionTypes { get; set; } = new();
}
