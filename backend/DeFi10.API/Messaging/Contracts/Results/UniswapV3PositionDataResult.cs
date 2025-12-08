namespace DeFi10.API.Messaging.Contracts.Results;

public sealed record UniswapV3PositionDataResult(
    string TokenId,
    object? PositionData,
    string? PoolAddress,
    bool Success,
    string? ErrorMessage
);
