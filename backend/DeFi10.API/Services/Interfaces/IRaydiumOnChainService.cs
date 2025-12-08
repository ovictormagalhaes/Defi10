using DeFi10.API.Services.Models.Solana.Raydium;

namespace DeFi10.API.Services.Interfaces
{
    public interface IRaydiumOnChainService
    {
        Task<List<RaydiumPosition>> GetPositionsAsync(string walletAddress);
    }
}
