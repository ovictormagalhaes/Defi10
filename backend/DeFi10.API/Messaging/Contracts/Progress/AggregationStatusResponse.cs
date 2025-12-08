using DeFi10.API.Messaging.Contracts.Enums;
using DeFi10.API.Models;

namespace DeFi10.API.Messaging.Contracts.Progress;

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
