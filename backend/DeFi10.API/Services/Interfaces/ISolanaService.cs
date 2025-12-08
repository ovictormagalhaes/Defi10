using DeFi10.API.Services.Interfaces;
using DeFi10.API.Services.Models;
using DeFi10.API.Services.Models.Solana.Common;
using DeFi10.API.Services.Models.Solana.Kamino;
using DeFi10.API.Services.Models.Solana.Raydium;
using DeFi10.API.Services.Solana;
using Chain = DeFi10.API.Models.Chain;

namespace DeFi10.API.Services.Interfaces
{
    public interface ISolanaService : IChainSupportService
    {
        Task<SolanaTokenResponse> GetTokensAsync(string address, Chain chain);
        Task<IEnumerable<KaminoPosition>> GetKaminoPositionsAsync(string address, Chain chain);
        Task<IEnumerable<RaydiumPosition>> GetRaydiumPositionsAsync(string address, Chain chain);
    }
}
