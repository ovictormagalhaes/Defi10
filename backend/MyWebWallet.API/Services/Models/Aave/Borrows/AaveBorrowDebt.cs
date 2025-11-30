using MyWebWallet.API.Services.Models.Aave.Supplies;
using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Borrows;

public class AaveBorrowDebt
{
    [JsonPropertyName("amount")]
    public AaveSupplyAmount Amount { get; set; } = new();
    
    [JsonPropertyName("usd")]
    public string Usd { get; set; } = string.Empty;
}
