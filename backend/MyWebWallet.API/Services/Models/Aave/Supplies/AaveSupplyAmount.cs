using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class AaveSupplyAmount
{
    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;
}
