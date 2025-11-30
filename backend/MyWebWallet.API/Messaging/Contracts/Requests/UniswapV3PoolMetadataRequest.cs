namespace MyWebWallet.API.Messaging.Contracts.Requests;

public sealed record UniswapV3PoolMetadataRequest(
    Guid JobId,
    string Account,
    string Chain,
    string PoolAddress
);
