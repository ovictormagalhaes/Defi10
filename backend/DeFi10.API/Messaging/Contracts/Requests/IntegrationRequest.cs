using DeFi10.API.Messaging.Contracts.Enums;

namespace DeFi10.API.Messaging.Contracts.Requests;

public sealed record IntegrationRequest(
    Guid JobId,
    Guid RequestId,
    string Account,
    IReadOnlyList<string> Chains,
    IntegrationProvider Provider,
    DateTime RequestedAtUtc,
    int Attempt,
    TimeSpan? OperationTimeout = null,
    IReadOnlyDictionary<string, string>? Metadata = null
);
