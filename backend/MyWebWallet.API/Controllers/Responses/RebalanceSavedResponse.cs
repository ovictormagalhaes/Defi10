namespace MyWebWallet.API.Controllers.Responses;

public class RebalanceSavedResponse
{
    public string Key { get; set; } = string.Empty;
    public int ItemsCount { get; set; }
    public IEnumerable<string> Accounts { get; set; } = Array.Empty<string>();
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
