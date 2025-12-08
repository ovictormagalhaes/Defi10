using DeFi10.API.Services.Models.CoinMarketCap;

namespace DeFi10.API.Services.Interfaces;

public interface ICoinMarketCapService
{
    Task<CmcQuotesLatestV2Response?> GetQuotesLatestV2Async(IEnumerable<string> symbols, CancellationToken ct = default);
}
