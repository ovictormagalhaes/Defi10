namespace DeFi10.API.Messaging.Contracts.Results;

public sealed record UniswapV3TickInfoResult(
    string PoolAddress,
    int TickLower,
    int TickUpper,
    object? LowerTickInfo,
    object? UpperTickInfo,
    bool Success,
    string? ErrorMessage
);
