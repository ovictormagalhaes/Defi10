using MyWebWallet.API.Models;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Interfaces;

public interface ICoinMarketCapService
{
    Task<decimal?> GetPriceUsdAsync(string symbol, ChainEnum? chain = null, CancellationToken ct = default);
    Task<IDictionary<string, decimal?>> GetPricesUsdAsync(IEnumerable<string> symbols, CancellationToken ct = default);
}
