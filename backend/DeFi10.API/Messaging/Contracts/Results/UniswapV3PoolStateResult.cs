namespace DeFi10.API.Messaging.Contracts.Results;

public sealed record UniswapV3PoolStateResult(
    string PoolAddress,
    object? PoolState,
    bool Success,
    string? ErrorMessage
);
