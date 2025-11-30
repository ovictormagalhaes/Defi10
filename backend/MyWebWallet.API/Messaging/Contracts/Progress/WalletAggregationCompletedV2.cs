using MyWebWallet.API.Messaging.Contracts.Enums;

namespace MyWebWallet.API.Messaging.Contracts.Progress;

public sealed record WalletAggregationCompletedV2(
    Guid JobId,
    Guid? WalletGroupId,
    IReadOnlyList<string> Accounts,
    AggregationStatus Status,
    DateTime CompletedAtUtc,
    int Total,
    int Succeeded,
    int Failed,
    int TimedOut
);
