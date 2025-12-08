using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Aave.Supplies;

public class AaveSupplyCurrency
{
    [JsonPropertyName("symbol")]
    public string Symbol { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;
}
