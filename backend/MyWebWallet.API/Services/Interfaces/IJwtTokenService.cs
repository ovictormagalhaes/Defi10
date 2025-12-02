namespace MyWebWallet.API.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Guid walletGroupId, string? displayName);
    Guid? ValidateToken(string token);
}
