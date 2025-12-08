using DeFi10.API.Models;
using DeFi10.API.Services.Models;

namespace DeFi10.API.Services.Interfaces
{
    public interface IMoralisService
    {
        Task<MoralisGetERC20TokenResponse> GetERC20TokenBalanceAsync(string address, string chain);
        Task<MoralisGetDeFiPositionsResponse> GetDeFiPositionsAsync(string address, string chain);
        Task<MoralisGetNFTsResponse> GetNFTsAsync(string address, string chain);
    }
}