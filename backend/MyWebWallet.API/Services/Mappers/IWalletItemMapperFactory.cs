using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Models;
using MyWebWallet.API.Services.Models.Aave.Supplies;
using MyWebWallet.API.Services.Models.Solana.Common;
using MyWebWallet.API.Services.Models.Solana.Kamino;
using MyWebWallet.API.Services.Models.Solana.Raydium;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Mappers;

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
