using MyWebWallet.API.Models;

namespace MyWebWallet.API.Services.Interfaces;

public interface IWalletService
{
    Task<WalletResponse> GetWalletInfoAsync(string account);
}