namespace DeFi10.API.Messaging.Contracts.Enums;

public enum AggregationStatus
{
    Pending = 0,
    Running = 1,
    Completed = 2,
    CompletedWithErrors = 3,
    TimedOut = 4,
    Cancelled = 5
}
