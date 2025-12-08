namespace DeFi10.API.Messaging.Contracts.Results;

public sealed record UniswapV3PoolMetadataResult(
    string PoolAddress,
    object? Metadata,
    bool Success,
    string? ErrorMessage
);
