using System.Text.Json;
using MyWebWallet.API.Controllers.Requests;
using MyWebWallet.API.Services.Interfaces;

namespace MyWebWallet.API.Services;

public class RebalanceService : IRebalanceService
{
    private readonly ICacheService _cacheService;

    public RebalanceService(ICacheService cacheService)
    {
        _cacheService = cacheService;
    }

    public async Task SaveAsync(string accountId, List<RebalanceItem> items)
    {
        ValidateItems(items);
        var key = _cacheService.GenerateRebalanceCacheKey(accountId);
        await _cacheService.SetPersistentAsync(key, items);
    }

    public async Task<Dictionary<string, List<RebalanceItem>>> SaveManyAsync(IEnumerable<string> accountIds, List<RebalanceItem> items)
    {
        ValidateItems(items);
        var result = new Dictionary<string, List<RebalanceItem>>();
        foreach (var id in accountIds)
        {
            var key = _cacheService.GenerateRebalanceCacheKey(id);
            await _cacheService.SetPersistentAsync(key, items);
            result[id] = items;
        }
        return result;
    }

    public async Task SaveForWalletGroupAsync(Guid walletGroupId, List<RebalanceItem> items)
    {
        ValidateItems(items);
        var key = $"rebalance:walletgroup:{walletGroupId}";
        await _cacheService.SetPersistentAsync(key, items);
    }

    public async Task<List<RebalanceItem>?> GetAsync(string accountId)
    {
        var key = _cacheService.GenerateRebalanceCacheKey(accountId);
        return await _cacheService.GetAsync<List<RebalanceItem>>(key);
    }

    public async Task<List<RebalanceItem>?> GetByWalletGroupAsync(Guid walletGroupId)
    {
        var key = $"rebalance:walletgroup:{walletGroupId}";
        return await _cacheService.GetAsync<List<RebalanceItem>>(key);
    }

    private static void ValidateItems(List<RebalanceItem> items)
    {
        if (items == null || items.Count == 0) throw new ArgumentException("Items are required");
        foreach (var it in items)
        {

            if (it.Assets == null || it.Assets.Count == 0)
            {
                throw new ArgumentException("Assets list is required and must contain at least one asset");
            }

            foreach (var asset in it.Assets)
            {
                if (string.IsNullOrWhiteSpace(asset.Key))
                {
                    throw new ArgumentException("Each asset must have a non-empty Key");
                }
            }
            
            if (it.Note < 0 || it.Note > 100) throw new ArgumentOutOfRangeException(nameof(it.Note), "Note must be between 0 and 100");

            it.Version = string.IsNullOrWhiteSpace(it.Version) ? "1" : it.Version.Trim();
            if (it.Value != null) it.Value = it.Value.Trim();
        }
    }
}
