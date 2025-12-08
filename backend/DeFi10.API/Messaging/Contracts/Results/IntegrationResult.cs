using DeFi10.API.Messaging.Contracts.Enums;

namespace DeFi10.API.Messaging.Contracts.Results;

public sealed record IntegrationResult(
    Guid JobId,
    Guid RequestId,
    string Account,
    IReadOnlyList<string> Chains,
    IntegrationProvider Provider,
    IntegrationStatus Status,
    DateTime StartedAtUtc,
    DateTime FinishedAtUtc,
    string? ErrorCode,
    string? ErrorMessage,
    object? Payload
);
