namespace DeFi10.API.Infrastructure;

public interface ISystemClock
{
    DateTime UtcNow { get; }
}
