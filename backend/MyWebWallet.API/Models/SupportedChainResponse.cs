namespace MyWebWallet.API.Models;

public class SupportedChainResponse
{
    public string Name { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
    public int ChainId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
}