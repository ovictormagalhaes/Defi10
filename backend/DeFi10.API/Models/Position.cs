using System.Text.Json.Serialization;

namespace DeFi10.API.Models;

public class Position
{
    public string Label { get; set; }
    public List<Token> Tokens { get; set; }


    [JsonIgnore]
    public string? ProtocolKey { get; set; }
    public string Key => !string.IsNullOrEmpty(ProtocolKey) ? $"{ProtocolKey}-{Label?.ToLowerInvariant()}" : Label?.ToLowerInvariant() ?? "";
}
