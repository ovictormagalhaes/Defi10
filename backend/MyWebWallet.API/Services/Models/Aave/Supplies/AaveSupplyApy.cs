using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Supplies;

public class AaveSupplyApy
{
    [JsonPropertyName("raw")]
    public string Raw { get; set; } = string.Empty;

    [JsonPropertyName("decimals")]
    public int Decimals { get; set; }

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty;

    [JsonPropertyName("formatted")]
    public string Formatted { get; set; } = string.Empty;
}
