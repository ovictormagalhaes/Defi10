using MyWebWallet.API.Messaging.Contracts.Enums;

namespace MyWebWallet.API.Messaging.Contracts.Requests;

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
