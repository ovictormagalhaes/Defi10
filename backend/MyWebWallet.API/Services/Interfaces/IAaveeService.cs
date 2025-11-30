using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Models;
using MyWebWallet.API.Services.Models.Aave.Supplies;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Interfaces;

public interface IAaveeService
{
    Task<AaveGetUserSuppliesResponse> GetUserSupplies(string address, string chain);
    Task<AaveGetUserBorrowsResponse> GetUserBorrows(string address, string chain);

    Task<HashSet<string>> GetWrapperTokenAddressesAsync(ChainEnum chain);
}