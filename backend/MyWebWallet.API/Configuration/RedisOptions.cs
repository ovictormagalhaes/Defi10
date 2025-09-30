namespace MyWebWallet.API.Configuration;

public sealed class RedisOptions
{
    public string? ConnectionString { get; set; }
    public string? User { get; set; }
    public string? Password { get; set; }
    public int ConnectTimeoutMs { get; set; } = 15000;
    public int SyncTimeoutMs { get; set; } = 15000;
    public int ConnectRetry { get; set; } = 5;
}
