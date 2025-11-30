namespace MyWebWallet.API.Messaging.Contracts.Requests;

public sealed record WalletAggregationRequested(
    Guid JobId,
    string Account,
    IReadOnlyList<string> Chains,
    DateTime RequestedAtUtc,
    int ExpectedIntegrations
);
