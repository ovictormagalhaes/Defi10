using MyWebWallet.API.Messaging.Contracts.Enums;
using MyWebWallet.API.Models;

namespace MyWebWallet.API.Messaging.Contracts.Progress;

public sealed record AggregationStatusResponse(
    Guid JobId,
    string Account,
    AggregationStatus Status,
    int ExpectedIntegrations,
    int Completed,
    int Succeeded,
    int Failed,
    int TimedOut,
    DateTime CreatedAtUtc,
    DateTime LastUpdatedAtUtc,
    bool IsFinal,
    IReadOnlyList<IntegrationProgressItem> Items,
    WalletResponse? FinalWallet
);
