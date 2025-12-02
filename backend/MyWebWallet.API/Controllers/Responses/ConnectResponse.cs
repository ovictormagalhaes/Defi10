namespace MyWebWallet.API.Controllers.Responses;

public sealed class ConnectResponse
{
    public required string Token { get; set; }
    public Guid WalletGroupId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public List<string> Wallets { get; set; } = new();
    public string? DisplayName { get; set; }
    public bool HasPassword { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
