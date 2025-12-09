using Microsoft.Extensions.Options;

namespace DeFi10.API.Configuration;

public sealed class AlchemyOptions : IValidateOptions<AlchemyOptions>
{
    public string ApiKey { get; set; } = string.Empty;
    public string NftUrl { get; set; } = string.Empty;
    public string BaseRpcUrl { get; set; } = string.Empty;
    public string ArbitrumRpcUrl { get; set; } = string.Empty;
    public string SolanaRpcUrl { get; set; } = string.Empty;
    public string EthereumRpcUrl { get; set; } = string.Empty;

    // Auto-computed properties that build URLs from ApiKey if not explicitly set
    public string GetNftUrl() => 
        !string.IsNullOrWhiteSpace(NftUrl) 
            ? NftUrl 
            : $"https://base-mainnet.g.alchemy.com/nft/v3/{ApiKey.Trim()}/";

    public string GetBaseRpcUrl() => 
        !string.IsNullOrWhiteSpace(BaseRpcUrl) 
            ? BaseRpcUrl 
            : $"https://base-mainnet.g.alchemy.com/v2/{ApiKey.Trim()}/";

    public string GetArbitrumRpcUrl() => 
        !string.IsNullOrWhiteSpace(ArbitrumRpcUrl) 
            ? ArbitrumRpcUrl 
            : $"https://arb-mainnet.g.alchemy.com/v2/{ApiKey.Trim()}/";

    public string GetSolanaRpcUrl() => 
        !string.IsNullOrWhiteSpace(SolanaRpcUrl) 
            ? SolanaRpcUrl 
            : $"https://solana-mainnet.g.alchemy.com/v2/{ApiKey.Trim()}";

    public string GetEthereumRpcUrl() => 
        !string.IsNullOrWhiteSpace(EthereumRpcUrl) 
            ? EthereumRpcUrl 
            : $"https://eth-mainnet.g.alchemy.com/v2/{ApiKey.Trim()}";

    public ValidateOptionsResult Validate(string? name, AlchemyOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.ApiKey))
        {
            return ValidateOptionsResult.Fail("Alchemy:ApiKey is required");
        }

        if (!string.IsNullOrWhiteSpace(options.NftUrl) && !Uri.TryCreate(options.NftUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail("Alchemy:NftUrl must be a valid URL");
        }

        if (!string.IsNullOrWhiteSpace(options.BaseRpcUrl) && !Uri.TryCreate(options.BaseRpcUrl, UriKind.Absolute, out _))
        {
            return ValidateOptionsResult.Fail("Alchemy:BaseRpcUrl must be a valid URL");
        }

        return ValidateOptionsResult.Success;
    }
}
