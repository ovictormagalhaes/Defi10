namespace MyWebWallet.API.Messaging.Contracts.Enums;

public enum IntegrationProvider
{
    MoralisTokens = 1,
    MoralisDeFi = 2,
    UniswapV3Positions = 3,
    AaveSupplies = 4,
    AaveBorrows = 5,
    AlchemyNfts = 6,
    TokenLogos = 7,
    
    // Novos eventos granulares para Uniswap V3
    UniswapV3PositionData = 10,      // GetPositionAsync individual
    UniswapV3PoolMetadata = 11,      // GetPoolMetadataAsync
    UniswapV3PoolState = 12,         // GetCurrentPoolStateAsync
    UniswapV3TickInfo = 13,          // GetTickInfoAsync + GetTickRangeInfoAsync
    UniswapV3FeeGrowth = 14,         // GetPoolFeeGrowthAsync
    UniswapV3PositionRange = 15,     // GetPositionRangeAsync
    UniswapV3TokenMetadata = 16,     // GetErc20MetadataAsync
    UniswapV3PositionEnumeration = 17, // Enumerate positions by owner

    // Pendle
    PendleVePositions = 30,
    PendleDeposits = 31,

    SolanaTokens = 80,
    SolanaKaminoPositions = 81,
    SolanaRaydiumPositions = 82
}
