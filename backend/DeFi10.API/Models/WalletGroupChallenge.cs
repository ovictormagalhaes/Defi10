namespace DeFi10.API.Models;

public sealed class WalletGroupChallenge
{
    public required string Challenge { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}
