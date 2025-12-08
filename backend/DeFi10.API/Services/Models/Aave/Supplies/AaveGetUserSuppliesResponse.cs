using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Aave.Supplies;

public class AaveGetUserSuppliesResponse
{
    [JsonPropertyName("data")]
    public UserSuppliesData Data { get; set; } = new();
}
