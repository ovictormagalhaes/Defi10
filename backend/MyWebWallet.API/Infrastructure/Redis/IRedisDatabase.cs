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

public sealed class RedisDatabaseWrapper : IRedisDatabase
{
    private readonly IDatabase _db;
    public RedisDatabaseWrapper(IConnectionMultiplexer mux) => _db = mux.GetDatabase();
    public Task<RedisValue> StringGetAsync(string key) => _db.StringGetAsync(key);
    public Task<bool> StringSetAsync(string key, string value, TimeSpan? expiry = null, When when = When.Always) => _db.StringSetAsync(key, value, expiry, when);
    public Task<HashEntry[]> HashGetAllAsync(string key) => _db.HashGetAllAsync(key);
    public Task HashSetAsync(string key, HashEntry[] entries) => _db.HashSetAsync(key, entries);
    public Task<bool> KeyExistsAsync(string key) => _db.KeyExistsAsync(key);
    public Task<bool> SetAddAsync(string key, RedisValue value) => _db.SetAddAsync(key, value);
    public Task KeyExpireAsync(string key, TimeSpan? expiry) => _db.KeyExpireAsync(key, expiry);
    public Task<RedisValue> HashGetAsync(string key, RedisValue field) => _db.HashGetAsync(key, field);
    public async Task<RedisValue[]> SetMembersAsync(string key) => (await _db.SetMembersAsync(key)).Select(v => (RedisValue)v).ToArray();
    public Task<TimeSpan?> KeyTimeToLiveAsync(string key) => _db.KeyTimeToLiveAsync(key);
}
