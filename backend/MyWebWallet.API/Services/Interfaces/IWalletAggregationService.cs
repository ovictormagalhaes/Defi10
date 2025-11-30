using MyWebWallet.API.Models;

namespace MyWebWallet.API.Services.Interfaces;


public interface IWalletAggregationService
{
    Task<WalletResponse> GetWalletTokensAsync(string account);
    bool IsValidAddress(string account);
    string NetworkName { get; }
}