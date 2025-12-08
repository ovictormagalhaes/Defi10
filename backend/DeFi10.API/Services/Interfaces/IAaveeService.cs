using DeFi10.API.Models;
using DeFi10.API.Services.Models;
using DeFi10.API.Services.Models.Aave.Supplies;
using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Services.Interfaces;

public interface IAaveeService
{
    Task<AaveGetUserSuppliesResponse> GetUserSupplies(string address, string chain);
    Task<AaveGetUserBorrowsResponse> GetUserBorrows(string address, string chain);

    Task<HashSet<string>> GetWrapperTokenAddressesAsync(ChainEnum chain);
}