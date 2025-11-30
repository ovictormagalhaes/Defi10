namespace MyWebWallet.API.Configuration;

public sealed class AggregationOptions
{
    public int JobTtlSeconds { get; set; } = 300;
}