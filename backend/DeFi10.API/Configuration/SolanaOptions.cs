using Microsoft.Extensions.Options;

namespace DeFi10.API.Configuration;

public sealed class SolanaOptions : IValidateOptions<SolanaOptions>
{
    public string RpcUrl { get; set; } = string.Empty;
    public List<string> FallbackRpcUrls { get; set; } = new();
    public bool UseFallbackOnRateLimit { get; set; } = true;
    public int RateLimitDelayMs { get; set; } = 1000;
    public int RequestTimeoutSeconds { get; set; } = 30;
    public int MaxRetries { get; set; } = 0;

    // Injected via PostConfigure
    internal AlchemyOptions? AlchemyOptions { get; set; }

    public string GetRpcUrl()
    {
        if (!string.IsNullOrWhiteSpace(RpcUrl))
            return RpcUrl;
        
        if (AlchemyOptions != null && !string.IsNullOrWhiteSpace(AlchemyOptions.ApiKey))
            return AlchemyOptions.GetSolanaRpcUrl();
        
        return FallbackRpcUrls.FirstOrDefault() ?? string.Empty;
    }

    public ValidateOptionsResult Validate(string? name, SolanaOptions options)
    {
        var rpcUrl = options.GetRpcUrl();
        
        if (string.IsNullOrWhiteSpace(rpcUrl))
        {
            return ValidateOptionsResult.Fail("Solana:RpcUrl is required (or provide Alchemy:ApiKey)");
        }

        if (!Uri.TryCreate(rpcUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail("Solana:RpcUrl must be a valid URL");
        }

        if (options.RateLimitDelayMs < 0)
        {
            return ValidateOptionsResult.Fail("Solana:RateLimitDelayMs must be >= 0");
        }

        if (options.RequestTimeoutSeconds <= 0)
        {
            return ValidateOptionsResult.Fail("Solana:RequestTimeoutSeconds must be > 0");
        }

        return ValidateOptionsResult.Success;
    }
}
