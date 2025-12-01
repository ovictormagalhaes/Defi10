using Microsoft.Extensions.Options;

namespace MyWebWallet.API.Configuration;

public sealed class MoralisOptions : IValidateOptions<MoralisOptions>
{
    public bool Enabled { get; set; } = true;
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string SolanaBaseUrl { get; set; } = string.Empty;
    public Dictionary<string, string> ChainMap { get; set; } = new();

    public ValidateOptionsResult Validate(string? name, MoralisOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.ApiKey))
            return ValidateOptionsResult.Fail("Moralis:ApiKey is required");

        if (string.IsNullOrWhiteSpace(options.BaseUrl))
            return ValidateOptionsResult.Fail("Moralis:BaseUrl is required");

        return ValidateOptionsResult.Success;
    }
}
