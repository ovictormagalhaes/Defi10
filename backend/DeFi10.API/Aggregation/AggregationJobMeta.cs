using DeFi10.API.Messaging.Contracts.Enums;
using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Aggregation;

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
