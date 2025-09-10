using MyWebWallet.API.Services.Models;

namespace MyWebWallet.API.Models;

public class WalletResponse
{
    public string Account { get; set; } = string.Empty;
    public string Network { get; set; } = string.Empty;
    public List<WalletItem> Items { get; set; } = new List<WalletItem>();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}