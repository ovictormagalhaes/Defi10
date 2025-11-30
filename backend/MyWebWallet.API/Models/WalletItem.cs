using System.Text.Json.Serialization;

namespace MyWebWallet.API.Models;

public class WalletItem
{
    public WalletItemType Type { get; set; }

    public Protocol Protocol { get; set; }
    public Position Position { get; set; }
    public AdditionalData AdditionalData { get; set; }
}