using StackExchange.Redis;

namespace MyWebWallet.API.Infrastructure.Redis;

public interface IRedisDatabase
{
    Task<RedisValue> StringGetAsync(string key);
    Task<bool> StringSetAsync(string key, string value, TimeSpan? expiry = null, When when = When.Always);
    Task<HashEntry[]> HashGetAllAsync(string key);
    Task HashSetAsync(string key, HashEntry[] entries);
    Task<bool> KeyExistsAsync(string key);
    Task<bool> SetAddAsync(string key, RedisValue value);
    Task KeyExpireAsync(string key, TimeSpan? expiry);
    Task<RedisValue> HashGetAsync(string key, RedisValue field);
    Task<RedisValue[]> SetMembersAsync(string key);
    Task<TimeSpan?> KeyTimeToLiveAsync(string key);
}
