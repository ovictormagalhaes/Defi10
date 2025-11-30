using MyWebWallet.API.Models;

namespace MyWebWallet.API.Controllers.Requests;

public class RebalanceItem
{
    public string Version { get; set; } = "1";

    public List<RebalanceAsset> Assets { get; set; } = new();
    
    public int Note { get; set; } = 0;
    public RebalanceReferenceType ByGroupType { get; set; } = RebalanceReferenceType.Unknown;
    public string? Value { get; set; }
    public RebalanceItemAdditionalInfo AdditionalInfo { get; set; } = new();
}
