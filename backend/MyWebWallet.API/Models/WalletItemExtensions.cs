namespace MyWebWallet.API.Models;

public static class WalletItemExtensions
{
    /// <summary>
    /// Populates the Key hierarchy for Protocol -> Position -> Token
    /// Call this after creating/mapping a WalletItem to ensure all keys are set correctly
    /// </summary>
    public static void PopulateKeys(this WalletItem walletItem)
    {
        if (walletItem?.Protocol == null || walletItem?.Position == null) return;
        
        // Protocol.Key is computed automatically
        var protocolKey = walletItem.Protocol.Key;
        
        // Set ProtocolKey in Position so Position.Key can be computed
        walletItem.Position.ProtocolKey = protocolKey;
        var positionKey = walletItem.Position.Key;
        
        // Set PositionKey in each Token so Token.Key can be computed
        if (walletItem.Position.Tokens != null)
        {
            foreach (var token in walletItem.Position.Tokens)
            {
                token.PositionKey = positionKey;
            }
        }
    }
    
    /// <summary>
    /// Populates keys for a collection of WalletItems
    /// </summary>
    public static void PopulateKeys(this IEnumerable<WalletItem> walletItems)
    {
        if (walletItems == null) return;
        
        foreach (var item in walletItems)
        {
            item.PopulateKeys();
        }
    }
}
