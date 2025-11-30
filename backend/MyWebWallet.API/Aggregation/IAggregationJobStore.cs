using StackExchange.Redis;
using MyWebWallet.API.Infrastructure;
using MyWebWallet.API.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using MyWebWallet.API.Aggregation;
using MyWebWallet.API.Messaging.Contracts.Enums;
using MyWebWallet.API.Messaging.Contracts.Requests;
using MyWebWallet.API.Messaging.Contracts.Results;
using MyWebWallet.API.Messaging.Contracts.Progress;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Aggregation;

public record AggregationJobMeta(
    Guid JobId,
    string Account,
    IReadOnlyList<ChainEnum> Chains,
    DateTime CreatedAt,
    int ExpectedTotal,
    AggregationStatus Status,
    int Succeeded,
    int Failed,
    int TimedOut,
    int ProcessedCount,
    bool FinalEmitted);

public interface IAggregationJobStore
{
    Task<Guid> CreateOrReuseSingleAsync(string accountLower, ChainEnum chain, IEnumerable<IntegrationProvider> providers, TimeSpan ttl, CancellationToken ct = default);
    Task<Guid> CreateOrReuseMultiAsync(string accountLower, IReadOnlyList<ChainEnum> chains, IEnumerable<(IntegrationProvider provider, ChainEnum chain)> combos, TimeSpan ttl, CancellationToken ct = default);
    Task RecordPublicationAsync(Guid jobId, string accountLower, IEnumerable<ChainEnum> chains, IEnumerable<(IntegrationProvider provider, ChainEnum chain)> combos, TimeSpan ttl, CancellationToken ct = default);
    Task<AggregationJobMeta?> GetMetaAsync(Guid jobId, CancellationToken ct = default);
    Task AddResultAsync(Guid jobId, string providerKey, string json, TimeSpan ttl, CancellationToken ct = default);
    IAsyncEnumerable<Guid> ListRecentJobsAsync(string accountLower, int limit, CancellationToken ct = default);
}

public sealed class AggregationJobStore : IAggregationJobStore
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<AggregationJobStore> _logger;
    private readonly ISystemClock _clock;

    public AggregationJobStore(IConnectionMultiplexer redis, ILogger<AggregationJobStore> logger, ISystemClock clock)
    {
        _redis = redis; _logger = logger; _clock = clock;
    }

    public async Task<Guid> CreateOrReuseSingleAsync(string accountLower, ChainEnum chain, IEnumerable<IntegrationProvider> providers, TimeSpan ttl, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var activeKey = RedisKeys.ActiveSingle(accountLower, chain);
        var existing = await db.StringGetAsync(activeKey);
        if (existing.HasValue && Guid.TryParse(existing.ToString(), out var jobId) && await db.KeyExistsAsync(RedisKeys.Meta(jobId)))
        {
            _logger.LogDebug("Reuse single job {Job} chain={Chain}", jobId, chain);
            return jobId;
        }
        var newJob = Guid.NewGuid();
        await InitializeMetaAsync(newJob, accountLower, new []{ chain }, providers.Select(p => (p, chain)), ttl, db);
        await db.StringSetAsync(activeKey, newJob.ToString(), ttl);
        await IndexJobAsync(accountLower, newJob, ttl, db);
        _logger.LogInformation("Created new single aggregation job {Job} chain={Chain}", newJob, chain);
        return newJob;
    }

    public async Task<Guid> CreateOrReuseMultiAsync(string accountLower, IReadOnlyList<ChainEnum> chains, IEnumerable<(IntegrationProvider provider, ChainEnum chain)> combos, TimeSpan ttl, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var activeKey = RedisKeys.ActiveMulti(accountLower, chains);
        var existing = await db.StringGetAsync(activeKey);
        if (existing.HasValue && Guid.TryParse(existing.ToString(), out var jobId) && await db.KeyExistsAsync(RedisKeys.Meta(jobId)))
        {
            _logger.LogDebug("Reuse multi job {Job} chains={Chains}", jobId, string.Join(',', chains));
            return jobId;
        }
        var newJob = Guid.NewGuid();
        await InitializeMetaAsync(newJob, accountLower, chains, combos, ttl, db);
        await db.StringSetAsync(activeKey, newJob.ToString(), ttl);
        await IndexJobAsync(accountLower, newJob, ttl, db);
        _logger.LogInformation("Created new multi aggregation job {Job} chains={Chains}", newJob, string.Join(',', chains));
        return newJob;
    }

    public async Task RecordPublicationAsync(Guid jobId, string accountLower, IEnumerable<ChainEnum> chains, IEnumerable<(IntegrationProvider provider, ChainEnum chain)> combos, TimeSpan ttl, CancellationToken ct = default)
    {
        // For idempotency: ensure meta exists (InitializeMetaAsync is safe-guarded)
        var db = _redis.GetDatabase();
        await InitializeMetaAsync(jobId, accountLower, chains.ToList(), combos, ttl, db, onlyIfMissing: true);
    }

    public async Task<AggregationJobMeta?> GetMetaAsync(Guid jobId, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var metaKey = RedisKeys.Meta(jobId);
        if (!await db.KeyExistsAsync(metaKey)) return null;
        var entries = await db.HashGetAllAsync(metaKey);
        var d = entries.ToDictionary(e => e.Name.ToString(), e => e.Value.ToString());
        return new AggregationJobMeta(
            jobId,
            d.TryGetValue("account", out var acct) ? acct : string.Empty,
            d.TryGetValue("chains", out var chStr) ? chStr.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => Enum.Parse<ChainEnum>(s)).ToList() : new List<ChainEnum>(),
            d.TryGetValue("created_at", out var created) && DateTime.TryParse(created, out var createdAt) ? createdAt : DateTime.MinValue,
            d.TryGetValue("expected_total", out var expStr) && int.TryParse(expStr, out var exp) ? exp : 0,
            d.TryGetValue("status", out var st) && Enum.TryParse<AggregationStatus>(st, out var statusVal) ? statusVal : AggregationStatus.Running,
            d.TryGetValue("succeeded", out var sucStr) && int.TryParse(sucStr, out var suc) ? suc : 0,
            d.TryGetValue("failed", out var failStr) && int.TryParse(failStr, out var fail) ? fail : 0,
            d.TryGetValue("timed_out", out var toStr) && int.TryParse(toStr, out var to) ? to : 0,
            d.TryGetValue("processed_count", out var pcStr) && int.TryParse(pcStr, out var pc) ? pc : 0,
            d.TryGetValue("final_emitted", out var feStr) && feStr == "1"
        );
    }

    public async Task AddResultAsync(Guid jobId, string providerKey, string json, TimeSpan ttl, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var key = RedisKeys.ResultPrefix(jobId) + providerKey;
        await db.StringSetAsync(key, json, ttl);
    }

    public async IAsyncEnumerable<Guid> ListRecentJobsAsync(string accountLower, int limit, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var indexKey = RedisKeys.Index(accountLower);
        // Sorted set range: highest scores first
        var nowScore = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var entries = await db.SortedSetRangeByScoreWithScoresAsync(indexKey, double.NegativeInfinity, nowScore, Exclude.None, Order.Descending, 0, limit);
        foreach (var e in entries)
        {
            if (ct.IsCancellationRequested) yield break;
            if (Guid.TryParse(e.Element.ToString(), out var jobId)) yield return jobId;
        }
    }

    private async Task InitializeMetaAsync(Guid jobId, string accountLower, IReadOnlyList<ChainEnum> chains, IEnumerable<(IntegrationProvider provider, ChainEnum chain)> combos, TimeSpan ttl, IDatabase db, bool onlyIfMissing = false)
    {
        var metaKey = RedisKeys.Meta(jobId);
        if (onlyIfMissing && await db.KeyExistsAsync(metaKey)) return;
        var now = _clock.UtcNow;
        var comboList = combos.ToList();
        var providersCount = comboList.Count;
        var hash = new HashEntry[]
        {
            new("account", accountLower),
            new("chains", string.Join(',', chains)),
            new("created_at", now.ToString("o")),
            new("expected_total", providersCount),
            new("status", AggregationStatus.Running.ToString()),
            new("succeeded", 0),
            new("failed", 0),
            new("timed_out", 0),
            new("final_emitted", 0),
            new("processed_count", 0)
        };
        await db.HashSetAsync(metaKey, hash);
        var pendingKey = RedisKeys.Pending(jobId);
        foreach (var c in comboList)
            await db.SetAddAsync(pendingKey, $"{c.provider.ToString().ToLowerInvariant()}:{c.chain.ToString().ToLowerInvariant()}");
        await db.KeyExpireAsync(metaKey, ttl);
        await db.KeyExpireAsync(pendingKey, ttl);
    }

    private async Task IndexJobAsync(string accountLower, Guid jobId, TimeSpan ttl, IDatabase db)
    {
        var indexKey = RedisKeys.Index(accountLower);
        var score = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        await db.SortedSetAddAsync(indexKey, jobId.ToString(), score);
        await db.KeyExpireAsync(indexKey, ttl);
    }
}
