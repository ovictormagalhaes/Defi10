using MyWebWallet.API.Messaging.Contracts.Enums;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Aggregation;

public record AggregationJobMeta(
    Guid JobId,
    string Account,
    IReadOnlyList<ChainEnum> Chains,
    DateTime CreatedAt,
    int ExpectedTotal,
    AggregationStatus Status,
    int Succeeded,
    int Failed,
    int TimedOut,
    int ProcessedCount,
    bool FinalEmitted);
