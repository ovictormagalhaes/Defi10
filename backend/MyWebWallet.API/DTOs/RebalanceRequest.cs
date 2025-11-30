using MyWebWallet.API.Models;

namespace MyWebWallet.API.DTOs;

public class RebalanceAsset
{
    public string Key { get; set; } = string.Empty;
    public RebalanceAssetType Type { get; set; } = RebalanceAssetType.Unknown;
}

public class RebalanceItem
{
    public string Version { get; set; } = "1";

    public List<RebalanceAsset> Assets { get; set; } = new();
    
    public int Note { get; set; } = 0;
    public RebalanceReferenceType ByGroupType { get; set; } = RebalanceReferenceType.Unknown;
    public string? Value { get; set; }
    public RebalanceItemAdditionalInfo AdditionalInfo { get; set; } = new();
}

public class RebalanceItemAdditionalInfo
{
    public string? Logo1 { get; set; }
    public string? Logo2 { get; set; }
}

public class RebalanceRequest
{

    public string? AccountId { get; set; }
    public List<string>? AccountIds { get; set; }

    public Guid? WalletGroupId { get; set; }

    public List<RebalanceItem> Items { get; set; } = new();
}

public class RebalanceSavedResponse
{
    public string Key { get; set; } = string.Empty;
    public int ItemsCount { get; set; }
    public IEnumerable<string> Accounts { get; set; } = Array.Empty<string>();
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
