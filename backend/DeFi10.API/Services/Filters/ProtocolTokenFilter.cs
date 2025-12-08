using System.Collections.Generic;
using System.Linq;

namespace DeFi10.API.Services.Filters
{


    public static class ProtocolTokenFilter
    {

        private static readonly HashSet<string> ProtocolTokenExceptions = new(StringComparer.OrdinalIgnoreCase)
        {
            "WETH",
            "WBTC",
            "WSOL",
            "WAVAX",
            "WMATIC",
            "WBNB",
            "ATOM",
            "ADA",
        };


        public static bool ShouldFilterToken(string? symbol, string? contractAddress = null)
        {
            if (string.IsNullOrWhiteSpace(symbol))
                return false;

            if (ProtocolTokenExceptions.Contains(symbol))
                return false;

            return HasProtocolTokenPattern(symbol);
        }


        private static bool HasProtocolTokenPattern(string symbol)
        {


            if (symbol.StartsWith('a') && symbol.Length > 1 && char.IsUpper(symbol[1]))
            {


                return true;
            }

            if (symbol.StartsWith("variableDebt", StringComparison.OrdinalIgnoreCase))
                return true;

            if (symbol.StartsWith("stableDebt", StringComparison.OrdinalIgnoreCase))
                return true;


            if (symbol.EndsWith("SOL", StringComparison.OrdinalIgnoreCase) && symbol.Length > 3)
            {

                if (symbol.Equals("SOL", StringComparison.OrdinalIgnoreCase))
                    return false;
                
                return true;
            }


            if (symbol.StartsWith('c') && symbol.Length > 1 && char.IsUpper(symbol[1]))
            {

                var compoundTokens = new HashSet<string>(StringComparer.OrdinalIgnoreCase) 
                { 
                    "cUSDC", "cDAI", "cUSDT", "cETH", "cWBTC", "cBAT", "cUNI", "cCOMP" 
                };
                
                if (compoundTokens.Contains(symbol))
                    return true;
            }


            if (symbol.Contains("ETH", StringComparison.OrdinalIgnoreCase) && 
                (symbol.StartsWith("st", StringComparison.OrdinalIgnoreCase) ||
                 symbol.StartsWith("cb", StringComparison.OrdinalIgnoreCase) ||
                 symbol.StartsWith("r", StringComparison.OrdinalIgnoreCase) ||
                 symbol.StartsWith("wst", StringComparison.OrdinalIgnoreCase)))
            {

                if (symbol.Equals("WETH", StringComparison.OrdinalIgnoreCase))
                    return false;
                
                var stakedEthTokens = new HashSet<string>(StringComparer.OrdinalIgnoreCase) 
                { 
                    "stETH", "wstETH", "cbETH", "rETH", "sETH2" 
                };
                
                if (stakedEthTokens.Contains(symbol))
                    return true;
            }

            return false;
        }


        public static string GetUnderlyingSymbol(string protocolTokenSymbol)
        {
            if (string.IsNullOrWhiteSpace(protocolTokenSymbol))
                return protocolTokenSymbol;

            if (protocolTokenSymbol.StartsWith('a') && char.IsUpper(protocolTokenSymbol[1]))
            {
                var underlying = protocolTokenSymbol[1..];


                var chainPrefixes = new[] { "Bas", "Eth", "Arb", "Pol", "Opt", "Avax" };
                foreach (var prefix in chainPrefixes)
                {
                    if (underlying.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    {
                        underlying = underlying[prefix.Length..];
                        break;
                    }
                }
                
                return underlying;
            }

            if (protocolTokenSymbol.StartsWith("variableDebt", StringComparison.OrdinalIgnoreCase))
            {
                var underlying = protocolTokenSymbol[12..];

                var chainPrefixes = new[] { "Bas", "Eth", "Arb", "Pol", "Opt", "Avax" };
                foreach (var prefix in chainPrefixes)
                {
                    if (underlying.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    {
                        underlying = underlying[prefix.Length..];
                        break;
                    }
                }
                
                return underlying;
            }

            if (protocolTokenSymbol.StartsWith("stableDebt", StringComparison.OrdinalIgnoreCase))
            {
                var underlying = protocolTokenSymbol[10..];

                var chainPrefixes = new[] { "Bas", "Eth", "Arb", "Pol", "Opt", "Avax" };
                foreach (var prefix in chainPrefixes)
                {
                    if (underlying.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    {
                        underlying = underlying[prefix.Length..];
                        break;
                    }
                }
                
                return underlying;
            }

            if (protocolTokenSymbol.EndsWith("SOL", StringComparison.OrdinalIgnoreCase) && 
                protocolTokenSymbol.Length > 3 &&
                !protocolTokenSymbol.Equals("SOL", StringComparison.OrdinalIgnoreCase))
            {
                return "SOL";
            }

            if (protocolTokenSymbol.Contains("ETH", StringComparison.OrdinalIgnoreCase) &&
                !protocolTokenSymbol.Equals("WETH", StringComparison.OrdinalIgnoreCase) &&
                !protocolTokenSymbol.Equals("ETH", StringComparison.OrdinalIgnoreCase))
            {
                var stakedEthTokens = new HashSet<string>(StringComparer.OrdinalIgnoreCase) 
                { 
                    "stETH", "wstETH", "cbETH", "rETH", "sETH2" 
                };
                
                if (stakedEthTokens.Contains(protocolTokenSymbol))
                    return "ETH";
            }

            if (protocolTokenSymbol.StartsWith('c') && protocolTokenSymbol.Length > 1 && char.IsUpper(protocolTokenSymbol[1]))
            {
                return protocolTokenSymbol[1..];
            }

            return protocolTokenSymbol;
        }
    }
}