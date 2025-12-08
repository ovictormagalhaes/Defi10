using DeFi10.API.Messaging.Contracts.Enums;

namespace DeFi10.API.Messaging.Contracts.Progress;

public sealed record WalletAggregationCompleted(
    Guid JobId,
    string Account,
    AggregationStatus Status,
    DateTime CompletedAtUtc,
    int Total,
    int Succeeded,
    int Failed,
    int TimedOut
);
