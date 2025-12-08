using DeFi10.API.Models;
using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Services.Interfaces;

public interface IChainSupportService
{
    bool SupportsChain(ChainEnum chain);
    IEnumerable<ChainEnum> GetSupportedChains();
}