namespace DeFi10.API.Services.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Guid walletGroupId, string? displayName);
    Guid? ValidateToken(string token);
}
