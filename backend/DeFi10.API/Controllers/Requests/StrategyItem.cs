using DeFi10.API.Models;

namespace DeFi10.API.Controllers.Requests;

public class StrategyItem
{
    public string Version { get; set; } = "1";

    public List<StrategyAsset> Assets { get; set; } = new();
    
    public int Note { get; set; } = 0;
    public StrategyReferenceType ByGroupType { get; set; } = StrategyReferenceType.Unknown;
    public string? Value { get; set; }
    public StrategyItemAdditionalInfo AdditionalInfo { get; set; } = new();
}
