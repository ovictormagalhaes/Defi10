using MyWebWallet.API.Services.Models.CoinMarketCap;

namespace MyWebWallet.API.Services.Interfaces;

public interface ICoinMarketCapService
{
    Task<CmcQuotesLatestV2Response?> GetQuotesLatestV2Async(IEnumerable<string> symbols, CancellationToken ct = default);
}
