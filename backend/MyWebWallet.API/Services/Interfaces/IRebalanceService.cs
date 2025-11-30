using MyWebWallet.API.Controllers.Requests;

namespace MyWebWallet.API.Services.Interfaces;

public interface IRebalanceService
{
    Task SaveAsync(string accountId, List<RebalanceItem> items);
    Task<Dictionary<string, List<RebalanceItem>>> SaveManyAsync(IEnumerable<string> accountIds, List<RebalanceItem> items);
    Task SaveForWalletGroupAsync(Guid walletGroupId, List<RebalanceItem> items);
    Task<List<RebalanceItem>?> GetAsync(string accountId);
    Task<List<RebalanceItem>?> GetByWalletGroupAsync(Guid walletGroupId);
}
