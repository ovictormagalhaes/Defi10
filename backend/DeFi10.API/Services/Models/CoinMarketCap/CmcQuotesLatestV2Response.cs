using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.CoinMarketCap;

public sealed class CmcQuotesLatestV2Response
{
    [JsonPropertyName("data")] public Dictionary<string, CmcAssetQuote> Data { get; set; } = new();
    [JsonPropertyName("status")] public CmcStatus Status { get; set; } = new();
}
