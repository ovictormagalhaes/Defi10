using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace MyWebWallet.API.Configuration;

public sealed class ProofOfWorkOptions : IValidateOptions<ProofOfWorkOptions>
{
    public const string SectionName = "ProofOfWork";

    [Range(1, 10, ErrorMessage = "Difficulty must be between 1 and 10")]
    public int Difficulty { get; set; } = 5;

    [Range(1, 30, ErrorMessage = "ChallengeTTLMinutes must be between 1 and 30")]
    public int ChallengeTTLMinutes { get; set; } = 5;

    public ValidateOptionsResult Validate(string? name, ProofOfWorkOptions options)
    {
        if (options.Difficulty < 1 || options.Difficulty > 10)
        {
            return ValidateOptionsResult.Fail("Difficulty must be between 1 and 10");
        }

        if (options.ChallengeTTLMinutes < 1 || options.ChallengeTTLMinutes > 30)
        {
            return ValidateOptionsResult.Fail("ChallengeTTLMinutes must be between 1 and 30");
        }

        return ValidateOptionsResult.Success;
    }
}
