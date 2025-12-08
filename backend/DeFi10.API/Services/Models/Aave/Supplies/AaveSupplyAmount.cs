using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Aave.Supplies;

public class AaveSupplyAmount
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;
}
