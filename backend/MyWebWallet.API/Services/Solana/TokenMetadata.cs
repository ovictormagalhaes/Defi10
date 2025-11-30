namespace MyWebWallet.API.Services.Solana;

public sealed class TokenMetadata
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}
