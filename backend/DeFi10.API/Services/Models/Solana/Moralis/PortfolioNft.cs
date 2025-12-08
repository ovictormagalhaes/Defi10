using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Solana.Moralis;

public class PortfolioNft
{
    [JsonPropertyName("mint")]
    public string Mint { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}
