using DeFi10.API.Models;
using DeFi10.API.Services.Models;
using DeFi10.API.Services.Models.Aave.Supplies;
using DeFi10.API.Services.Models.Solana.Common;
using DeFi10.API.Services.Models.Solana.Kamino;
using DeFi10.API.Services.Models.Solana.Raydium;
using DeFi10.API.Services.Interfaces;
using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Services.Mappers;

public interface IWalletItemMapperFactory
{
    IWalletItemMapper<IEnumerable<TokenDetail>> CreateMoralisTokenMapper();
    IWalletItemMapper<AaveGetUserSuppliesResponse> CreateAaveSuppliesMapper();
    IWalletItemMapper<AaveGetUserBorrowsResponse> CreateAaveBorrowsMapper();
    IWalletItemMapper<UniswapV3GetActivePoolsResponse> CreateUniswapV3Mapper();
    IWalletItemMapper<PendleVePositionsResponse> CreatePendleVeMapper();
    IWalletItemMapper<PendleDepositsResponse> CreatePendleDepositsMapper();

    IWalletItemMapper<SolanaTokenResponse> CreateSolanaTokenMapper();
    IWalletItemMapper<IEnumerable<KaminoPosition>> CreateSolanaKaminoMapper();
    IWalletItemMapper<IEnumerable<RaydiumPosition>> CreateSolanaRaydiumMapper();

    bool ValidateChainSupport<T>(ChainEnum chain) where T : class;
    IEnumerable<IChainSupportService> GetAllMappers();
}
