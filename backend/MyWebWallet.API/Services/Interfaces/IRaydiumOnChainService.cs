using MyWebWallet.API.Services.Models.Solana.Raydium;

namespace MyWebWallet.API.Services.Interfaces
{
    public interface IRaydiumOnChainService
    {
        Task<List<RaydiumPosition>> GetPositionsAsync(string walletAddress);
    }
}
