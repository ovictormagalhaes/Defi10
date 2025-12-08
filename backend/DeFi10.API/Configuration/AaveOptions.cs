using Microsoft.Extensions.Options;

namespace DeFi10.API.Configuration;

public sealed class AaveOptions : IValidateOptions<AaveOptions>
{
    public string GraphQLEndpoint { get; set; } = string.Empty;

    public ValidateOptionsResult Validate(string? name, AaveOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.GraphQLEndpoint))
            return ValidateOptionsResult.Fail("Aave:GraphQLEndpoint is required");

        return ValidateOptionsResult.Success;
    }
}
