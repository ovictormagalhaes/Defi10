using MyWebWallet.API.Models;

namespace MyWebWallet.API.Controllers.Requests;

public class RebalanceRequest
{

    public string? AccountId { get; set; }
    public List<string>? AccountIds { get; set; }

    public Guid? WalletGroupId { get; set; }

    public List<RebalanceItem> Items { get; set; } = new();
}
