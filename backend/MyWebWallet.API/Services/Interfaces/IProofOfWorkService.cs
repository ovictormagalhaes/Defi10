namespace MyWebWallet.API.Services.Interfaces;

public interface IProofOfWorkService
{
    Task<(string Challenge, DateTime ExpiresAt)> GenerateChallengeAsync();
    Task<bool> ValidateProofAsync(string challenge, string nonce);
    Task InvalidateChallengeAsync(string challenge);
}
