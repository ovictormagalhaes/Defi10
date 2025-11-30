using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class AaveSupplyBalance
{
    [JsonPropertyName("amount")]
    public AaveSupplyAmount Amount { get; set; } = new();

    [JsonPropertyName("usd")]
    public string Usd { get; set; } = string.Empty;
}
