using MyWebWallet.API.Messaging.Contracts.Enums;

namespace MyWebWallet.API.Messaging.Contracts.Progress;

public sealed record WalletAggregationProgress(
    Guid JobId,
    string Account,
    int ExpectedIntegrations,
    int Completed,
    int Succeeded,
    int Failed,
    int TimedOut,
    AggregationStatus AggregationStatus,
    DateTime LastUpdatedUtc,
    IReadOnlyList<IntegrationProgressItem> Items,
    bool IsFinal
);
