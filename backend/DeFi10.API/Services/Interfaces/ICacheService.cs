using DeFi10.API.Models;

namespace DeFi10.API.Services.Interfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null) where T : class;
    Task RemoveAsync(string key);
    Task<bool> ExistsAsync(string key);
    string GenerateWalletCacheKey(string address, Chain? chain = null);
    string GenerateWalletCacheKey(string address, IEnumerable<Chain> chains);
    Task SetPersistentAsync<T>(string key, T value) where T : class;
    string GenerateStrategyCacheKey(string accountId);
}