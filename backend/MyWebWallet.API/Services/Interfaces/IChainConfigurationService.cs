using MyWebWallet.API.Models;
using MyWebWallet.API.Configuration;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Interfaces
{
    public interface IChainConfigurationService
    {


        ChainConfig? GetChainConfig(ChainEnum chain);


        ChainConfig? GetChainConfig(string chainName);


        IEnumerable<ChainEnum> GetEnabledChains();


        IEnumerable<ChainEnum> GetAllChains();


        bool IsChainEnabled(ChainEnum chain);


        string? GetRpcUrl(ChainEnum chain, string? alchemyApiKey = null);


        T? GetProtocolConfig<T>(ChainEnum chain) where T : class;


        UniswapV3Config? GetUniswapV3Config(ChainEnum chain);


        AaveConfig? GetAaveConfig(ChainEnum chain);


        MoralisConfig? GetMoralisConfig(ChainEnum chain);


        ChainValidationResult ValidateChainConfig(ChainEnum chain);
    }

    public class ChainValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }
}