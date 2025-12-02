using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace MyWebWallet.API.Configuration;

public sealed class JwtOptions : IValidateOptions<JwtOptions>
{
    public const string SectionName = "Jwt";

    [Required(ErrorMessage = "Secret is required")]
    [MinLength(32, ErrorMessage = "Secret must be at least 32 characters")]
    public string Secret { get; set; } = string.Empty;

    [Required(ErrorMessage = "Issuer is required")]
    public string Issuer { get; set; } = string.Empty;

    [Required(ErrorMessage = "Audience is required")]
    public string Audience { get; set; } = string.Empty;

    [Range(5, 10080, ErrorMessage = "ExpirationMinutes must be between 5 and 10080 (7 days)")]
    public int ExpirationMinutes { get; set; } = 60;

    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Secret))
        {
            return ValidateOptionsResult.Fail("Secret is required");
        }

        if (options.Secret.Length < 32)
        {
            return ValidateOptionsResult.Fail("Secret must be at least 32 characters");
        }

        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            return ValidateOptionsResult.Fail("Issuer is required");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            return ValidateOptionsResult.Fail("Audience is required");
        }

        if (options.ExpirationMinutes < 5 || options.ExpirationMinutes > 10080)
        {
            return ValidateOptionsResult.Fail("ExpirationMinutes must be between 5 and 10080 (7 days)");
        }

        return ValidateOptionsResult.Success;
    }
}
