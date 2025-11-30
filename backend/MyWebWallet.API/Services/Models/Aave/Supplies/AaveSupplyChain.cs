using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class AaveSupplyChain
{
    [JsonPropertyName("chainId")]
    public int ChainId { get; set; }
}
