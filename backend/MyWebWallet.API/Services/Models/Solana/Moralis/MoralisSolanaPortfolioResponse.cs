using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Solana.Moralis;

public class MoralisSolanaPortfolioResponse
{
    [JsonPropertyName("nativeBalance")]
    public PortfolioNativeBalance NativeBalance { get; set; } = new();

    [JsonPropertyName("tokens")]
    public List<PortfolioToken> Tokens { get; set; } = new();

    [JsonPropertyName("nfts")]
    public List<PortfolioNft> Nfts { get; set; } = new();
}
