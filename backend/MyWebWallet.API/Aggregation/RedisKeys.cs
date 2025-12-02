namespace MyWebWallet.API.Aggregation;

using ChainEnum = MyWebWallet.API.Models.Chain;

public static class RedisKeys
{
    public static string ActiveSingle(string accountLower, ChainEnum chain) => $"wallet:agg:active:{accountLower}:{chain}";
    public static string ActiveMulti(string accountLower, IEnumerable<ChainEnum> chains) => $"wallet:agg:active:{accountLower}:{string.Join('+', chains.OrderBy(c => c.ToString()))}";
    public static string ActiveWalletGroup(Guid walletGroupId, IEnumerable<ChainEnum> chains) => $"wallet:agg:active:group:{walletGroupId}:{string.Join('+', chains.OrderBy(c => c.ToString()))}";
    public static string Meta(Guid jobId) => $"wallet:agg:{jobId}:meta";
    public static string Pending(Guid jobId) => $"wallet:agg:{jobId}:pending";
    public static string ResultPrefix(Guid jobId) => $"wallet:agg:{jobId}:result:"; 
    public static string Summary(Guid jobId) => $"wallet:agg:{jobId}:summary";
    public static string Wallet(Guid jobId) => $"wallet:agg:{jobId}:wallet";
    public static string Index(string accountLower) => $"wallet:agg:index:{accountLower}";
    
    public static string WalletCache(string accountLower, ChainEnum chain, string provider) => $"wallet:cache:{accountLower}:{chain.ToString().ToLowerInvariant()}:{provider.ToLowerInvariant()}";
    public static string WalletCachePattern(string accountLower) => $"wallet:cache:{accountLower}:*";
}
