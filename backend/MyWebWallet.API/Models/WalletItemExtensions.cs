namespace MyWebWallet.API.Models;

public static class WalletItemExtensions
{


    public static void PopulateKeys(this WalletItem walletItem)
    {
        if (walletItem?.Protocol == null || walletItem?.Position == null) return;

        var protocolKey = walletItem.Protocol.Key;

        walletItem.Position.ProtocolKey = protocolKey;
        var positionKey = walletItem.Position.Key;

        if (walletItem.Position.Tokens != null)
        {
            foreach (var token in walletItem.Position.Tokens)
            {
                token.PositionKey = positionKey;
            }
        }
    }


    public static void PopulateKeys(this IEnumerable<WalletItem> walletItems)
    {
        if (walletItems == null) return;
        
        foreach (var item in walletItems)
        {
            item.PopulateKeys();
        }
    }
}
