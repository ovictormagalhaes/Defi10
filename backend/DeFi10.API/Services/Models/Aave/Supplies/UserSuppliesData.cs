using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Aave.Supplies;

public class UserSuppliesData
{
    [JsonPropertyName("userSupplies")]
    public List<UserSupply> UserSupplies { get; set; } = new();
}
