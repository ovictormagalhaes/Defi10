using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class AaveGetUserSuppliesResponse
{
    [JsonPropertyName("data")]
    public UserSuppliesData Data { get; set; } = new();
}
