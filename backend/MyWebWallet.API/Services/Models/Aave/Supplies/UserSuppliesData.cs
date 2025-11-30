using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class UserSuppliesData
{
    [JsonPropertyName("userSupplies")]
    public List<UserSupply> UserSupplies { get; set; } = new();
}
