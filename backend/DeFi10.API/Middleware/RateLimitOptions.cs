namespace DeFi10.API.Middleware;

public class RateLimitOptions
{
    public bool Enabled { get; set; } = true;
    public int MaxRequests { get; set; } = 100;
    public TimeSpan Window { get; set; } = TimeSpan.FromMinutes(1);
}
