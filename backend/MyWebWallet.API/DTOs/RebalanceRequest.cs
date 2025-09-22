using MyWebWallet.API.Models;

namespace MyWebWallet.API.DTOs;

public class RebalanceItem
{
    public string Version { get; set; } = "1";
    public string Asset { get; set; } = string.Empty;
    public WalletItemType Type { get; set; } = WalletItemType.Unknown;
    // 0..100
    public int Note { get; set; } = 0;
    public RebalanceReferenceType ByGroupType { get; set; } = RebalanceReferenceType.Protocol;
    // e.g. aave-v3, uniswap-v3, wallet
    public string? Value { get; set; }
}

public class RebalanceRequest
{
    // Accept either a single accountId or multiple
    public string? AccountId { get; set; }
    public List<string>? AccountIds { get; set; }

    // The desired targets for rebalancing
    public List<RebalanceItem> Items { get; set; } = new();
}

public class RebalanceSavedResponse
{
    public string Key { get; set; } = string.Empty;
    public int ItemsCount { get; set; }
    public IEnumerable<string> Accounts { get; set; } = Array.Empty<string>();
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
