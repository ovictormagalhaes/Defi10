namespace MyWebWallet.API.Messaging.Contracts.Requests;

public sealed record UniswapV3PoolStateRequest(
    Guid JobId,
    string Account,
    string Chain,
    string PoolAddress
);
