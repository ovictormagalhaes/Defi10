namespace MyWebWallet.API.Models
{
    public static class ChainExtensions
    {
        public static string ToChainId(this Chain chain) => chain switch
        {
            Chain.Ethereum => "ethereum",
            Chain.Base => "base",
            Chain.Polygon => "polygon",
            Chain.Arbitrum => "arbitrum",
            Chain.Optimism => "optimism",
            Chain.BNB => "bsc",
            Chain.Solana => "solana",
            _ => chain.ToString().ToLowerInvariant()
        };

        public static string GetAlchemyRpcUrl(this Chain chain, string apiKey) => chain switch
        {
            Chain.Ethereum => $"https://eth-mainnet.g.alchemy.com/v2/{apiKey}",
            Chain.Base => $"https://base-mainnet.g.alchemy.com/v2/{apiKey}",
            Chain.Arbitrum => $"https://arb-mainnet.g.alchemy.com/v2/{apiKey}",
            Chain.Polygon => $"https://polygon-mainnet.g.alchemy.com/v2/{apiKey}",
            Chain.Optimism => $"https://opt-mainnet.g.alchemy.com/v2/{apiKey}",
            Chain.BNB => throw new NotSupportedException("Alchemy RPC not configured for BNB chain"),
            Chain.Solana => throw new NotSupportedException("GetAlchemyRpcUrl is EVM-only and does not support Solana"),
            _ => throw new NotSupportedException($"Unsupported chain for Alchemy RPC: {chain}")
        };
    }
}
