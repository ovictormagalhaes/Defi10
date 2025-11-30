namespace MyWebWallet.API.Infrastructure;

public interface ISystemClock
{
    DateTime UtcNow { get; }
}
