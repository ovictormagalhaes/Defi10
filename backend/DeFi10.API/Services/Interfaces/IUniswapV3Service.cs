using DeFi10.API.Services.Models;

namespace DeFi10.API.Services.Interfaces;

public interface IUniswapV3Service
{
    Task<UniswapV3GetActivePoolsResponse> GetActivePoolsAsync(string account);
}