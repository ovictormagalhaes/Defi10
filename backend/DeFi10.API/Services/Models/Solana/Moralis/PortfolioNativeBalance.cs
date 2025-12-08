using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Solana.Moralis;

public class PortfolioNativeBalance
{
    [JsonPropertyName("lamports")]
    public string Lamports { get; set; } = string.Empty;

    [JsonPropertyName("solana")]
    public string Solana { get; set; } = string.Empty;
}
