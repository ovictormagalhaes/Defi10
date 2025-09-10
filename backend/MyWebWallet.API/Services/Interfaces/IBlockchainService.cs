using MyWebWallet.API.Models;

namespace MyWebWallet.API.Services.Interfaces;

public interface IBlockchainService
{
    Task<WalletResponse> GetWalletTokensAsync(string account);
    bool IsValidAddress(string account);
    string NetworkName { get; }
}