using DeFi10.API.Models;

namespace DeFi10.API.Controllers.Requests;

public class StrategyAsset
{
    public string Key { get; set; } = string.Empty;
    public StrategyAssetType Type { get; set; } = StrategyAssetType.Unknown;
}
