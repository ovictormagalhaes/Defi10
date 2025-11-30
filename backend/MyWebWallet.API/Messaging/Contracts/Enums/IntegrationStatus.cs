namespace MyWebWallet.API.Messaging.Contracts.Enums;

public enum IntegrationStatus
{
    Pending = 0,
    InProgress = 1,
    Success = 2,
    Failed = 3,
    TimedOut = 4,
    Cancelled = 5
}
