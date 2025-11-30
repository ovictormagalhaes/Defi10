using MyWebWallet.API.Models;

namespace MyWebWallet.API.Controllers.Requests;

public class RebalanceAsset
{
    public string Key { get; set; } = string.Empty;
    public RebalanceAssetType Type { get; set; } = RebalanceAssetType.Unknown;
}
