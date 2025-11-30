using MyWebWallet.API.Models;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Aggregation;

public interface ITokenFactory
{
    Token CreateSupplied(string name, string symbol, string contract, ChainEnum chain, int decimals, decimal formattedAmount, decimal unitPriceUsd);
    Token CreateBorrowed(string name, string symbol, string contract, ChainEnum chain, int decimals, decimal formattedAmount, decimal unitPriceUsd);
    Token CreateUncollectedReward(string name, string symbol, string contract, ChainEnum chain, int decimals, decimal formattedAmount, decimal unitPriceUsd);
    Token CreateStaked(string name, string symbol, string contract, ChainEnum chain, int decimals, decimal formattedAmount, decimal unitPriceUsd);
    Token CreateGovernancePower(string name, string symbol, string contract, ChainEnum chain, int decimals, decimal formattedAmount);
}