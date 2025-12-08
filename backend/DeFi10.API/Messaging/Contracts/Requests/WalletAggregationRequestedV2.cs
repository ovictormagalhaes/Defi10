namespace DeFi10.API.Messaging.Contracts.Requests;

public sealed record WalletAggregationRequestedV2(
    Guid JobId,
    Guid? WalletGroupId,
    IReadOnlyList<string> Accounts,
    IReadOnlyList<string> Chains,
    DateTime RequestedAtUtc,
    int ExpectedIntegrations
);
