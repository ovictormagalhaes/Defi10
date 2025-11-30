using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Models;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Interfaces;

public interface IPendleService
{

    Task<PendleVePositionsResponse?> GetVePositionsAsync(string account, ChainEnum chain);

    Task<PendleDepositsResponse?> GetDepositsAsync(string account, ChainEnum chain);
}
