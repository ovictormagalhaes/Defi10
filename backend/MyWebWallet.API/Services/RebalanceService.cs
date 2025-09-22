using System.Text.Json;
using MyWebWallet.API.DTOs;
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

    public async Task<List<RebalanceItem>?> GetAsync(string accountId)
    {
        var key = _cacheService.GenerateRebalanceCacheKey(accountId);
        return await _cacheService.GetAsync<List<RebalanceItem>>(key);
    }

    private static void ValidateItems(List<RebalanceItem> items)
    {
        if (items == null || items.Count == 0) throw new ArgumentException("Items are required");
        foreach (var it in items)
        {
            if (string.IsNullOrWhiteSpace(it.Asset)) throw new ArgumentException("Asset is required for each item");
            if (it.Note < 0 || it.Note > 100) throw new ArgumentOutOfRangeException(nameof(it.Note), "Note must be between 0 and 100");
            // Version optional but normalize
            it.Version = string.IsNullOrWhiteSpace(it.Version) ? "1" : it.Version.Trim();
            if (it.Value != null) it.Value = it.Value.Trim();
        }
    }
}
