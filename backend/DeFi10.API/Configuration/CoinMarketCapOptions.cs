namespace DeFi10.API.Services;

public sealed class CoinMarketCapOptions
{
    public string? ApiKey { get; set; }
    public string BaseUrl { get; set; } = "https://pro-api.coinmarketcap.com/v1";
    public bool Enabled { get; set; } = true;
    public int TimeoutMs { get; set; } = 5000;
}
