namespace MyWebWallet.API.Messaging.Contracts.Requests;

public sealed record UniswapV3PositionDataRequest(
    Guid JobId,
    string Account,
    string Chain,
    string TokenId,
    string? PoolAddress = null
);
