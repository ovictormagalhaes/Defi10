using Microsoft.Extensions.Options;

namespace DeFi10.API.Configuration;

public sealed class AggregationOptions : IValidateOptions<AggregationOptions>
{
    public int JobTtlSeconds { get; set; } = 300;
    public int TimeoutScanSeconds { get; set; } = 60;
    public int JobTimeoutSeconds { get; set; } = 180;
    public int WalletCacheTtlMinutes { get; set; } = 5;
    public bool EnableCoinMarketCapLookup { get; set; } = true;

    public ValidateOptionsResult Validate(string? name, AggregationOptions options)
    {
        if (options.JobTtlSeconds <= 0)
        {
            return ValidateOptionsResult.Fail("Aggregation:JobTtlSeconds must be > 0");
        }

        if (options.TimeoutScanSeconds < 5 || options.TimeoutScanSeconds > 300)
        {
            return ValidateOptionsResult.Fail("Aggregation:TimeoutScanSeconds must be between 5 and 300");
        }

        if (options.JobTimeoutSeconds < 30 || options.JobTimeoutSeconds > 3600)
        {
            return ValidateOptionsResult.Fail("Aggregation:JobTimeoutSeconds must be between 30 and 3600");
        }

        if (options.WalletCacheTtlMinutes < 1 || options.WalletCacheTtlMinutes > 60)
        {
            return ValidateOptionsResult.Fail("Aggregation:WalletCacheTtlMinutes must be between 1 and 60");
        }

        return ValidateOptionsResult.Success;
    }
}