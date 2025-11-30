using MyWebWallet.API.Messaging.Contracts.Enums;

namespace MyWebWallet.API.Messaging.Contracts.Progress;

public sealed record IntegrationProgressItem(
    IntegrationProvider Provider,
    IntegrationStatus Status,
    DateTime? FinishedAtUtc,
    string? ErrorCode
);
