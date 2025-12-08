namespace DeFi10.API.Messaging.Contracts.Requests;

public sealed record UniswapV3TickInfoRequest(
    Guid JobId,
    string Account,
    string Chain,
    string PoolAddress,
    int TickLower,
    int TickUpper
);
