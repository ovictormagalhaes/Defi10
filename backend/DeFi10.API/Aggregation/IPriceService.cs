using DeFi10.API.Models;
using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Aggregation;

public interface IPriceService
{
    Task<IDictionary<string, decimal>> HydratePricesAsync(IEnumerable<WalletItem> walletItems, ChainEnum chain, CancellationToken ct = default);
}
