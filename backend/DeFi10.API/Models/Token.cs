using System.Text.Json.Serialization;

namespace DeFi10.API.Models;

public class Token
{
    public TokenType? Type { get; set; }
    public string Name { get; set; }
    public string Chain { get; set; }
    public string Symbol { get; set; }
    public string ContractAddress { get; set; }
    public string? Logo { get; set; }
    public string Thumbnail { get; set; }
    public TokenFinancials Financials { get; set; } = new();
    public bool? Native { get; set; }
    public bool? PossibleSpam { get; set; }


    [JsonIgnore]
    public string? PositionKey { get; set; }
    public string Key => !string.IsNullOrEmpty(PositionKey) 
        ? $"{PositionKey}-{Type?.ToString().ToLowerInvariant()}-{Symbol?.ToLowerInvariant()}-{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}"
        : $"{Type?.ToString().ToLowerInvariant()}-{Symbol?.ToLowerInvariant()}-{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}";
}
