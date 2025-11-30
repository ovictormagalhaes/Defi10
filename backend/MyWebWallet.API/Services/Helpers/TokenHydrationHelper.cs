using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;
using MyWebWallet.API.Services.Solana;

namespace MyWebWallet.API.Services.Helpers;


public class TokenHydrationHelper
{
    private readonly ITokenMetadataService _metadataService;
    private readonly ILogger<TokenHydrationHelper> _logger;

    public TokenHydrationHelper(ITokenMetadataService metadataService, ILogger<TokenHydrationHelper> logger)
    {
        _metadataService = metadataService;
        _logger = logger;
    }


    public async Task<Dictionary<string, string?>> HydrateTokenLogosAsync(
        IEnumerable<WalletItem> walletItems, 
        Chain chain, 
        Dictionary<string, string>? incomingLogos = null)
    {
        var uniqueTokens = ExtractUniqueTokens(walletItems);
        
        if (!uniqueTokens.Any())
            return new Dictionary<string, string?>();

        _logger.LogDebug("Found {TokenCount} unique tokens for hydration on {Chain}", uniqueTokens.Count, chain);

        var existingLogos = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        var tokensToStore = new Dictionary<string, TokenMetadata>();

        foreach (var tokenAddress in uniqueTokens)
        {
            var normalizedAddress = tokenAddress.ToLowerInvariant();

            var metadata = await _metadataService.GetTokenMetadataAsync(normalizedAddress);
            
            if (metadata?.LogoUrl != null)
            {
                existingLogos[normalizedAddress] = metadata.LogoUrl;
            }
            else
            {

                if (incomingLogos?.TryGetValue(normalizedAddress, out var incomingLogo) == true && !string.IsNullOrEmpty(incomingLogo))
                {
                    existingLogos[normalizedAddress] = incomingLogo;

                    tokensToStore[normalizedAddress] = new TokenMetadata
                    {
                        Symbol = string.Empty,
                        Name = string.Empty,
                        LogoUrl = incomingLogo
                    };
                }
            }
        }

        var logosFromTokens = ExtractLogosFromTokens(walletItems);
        foreach (var kvp in logosFromTokens)
        {
            var normalizedAddress = kvp.Key.ToLowerInvariant();
            
            if (!existingLogos.ContainsKey(normalizedAddress) && !string.IsNullOrEmpty(kvp.Value))
            {
                existingLogos[normalizedAddress] = kvp.Value;
                
                tokensToStore[normalizedAddress] = new TokenMetadata
                {
                    Symbol = string.Empty,
                    Name = string.Empty,
                    LogoUrl = kvp.Value
                };
            }
        }

        foreach (var kvp in tokensToStore)
        {
            await _metadataService.SetTokenMetadataAsync(kvp.Key, kvp.Value);
        }

        if (tokensToStore.Any())
        {
            _logger.LogDebug("Stored {TokenCount} new token metadata entries on {Chain}", tokensToStore.Count, chain);
        }

        return existingLogos;
    }


    public async Task ApplyTokenLogosToWalletItemsAsync(IEnumerable<WalletItem> walletItems, Dictionary<string, string?> tokenLogos)
    {

        var symbolToLogo = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var allTokens = walletItems.SelectMany(wi => wi.Position?.Tokens ?? Enumerable.Empty<Token>()).ToList();
        
        foreach (var token in allTokens)
        {
            if (string.IsNullOrEmpty(token.Symbol)) continue;

            if (!string.IsNullOrEmpty(token.ContractAddress))
            {
                var normalizedAddress = token.ContractAddress.ToLowerInvariant();
                if (tokenLogos.TryGetValue(normalizedAddress, out var logoByAddress) && !string.IsNullOrEmpty(logoByAddress))
                {
                    var normalizedSymbol = token.Symbol.ToUpperInvariant();
                    if (!symbolToLogo.ContainsKey(normalizedSymbol))
                    {
                        symbolToLogo[normalizedSymbol] = logoByAddress;
                    }
                }
            }

            if (!string.IsNullOrEmpty(token.Logo))
            {
                var normalizedSymbol = token.Symbol.ToUpperInvariant();
                if (!symbolToLogo.ContainsKey(normalizedSymbol))
                {
                    symbolToLogo[normalizedSymbol] = token.Logo;
                }
            }
        }

        foreach (var walletItem in walletItems)
        {
            if (walletItem.Position?.Tokens != null)
            {
                foreach (var token in walletItem.Position.Tokens)
                {

                    if (!string.IsNullOrEmpty(token.Logo)) continue;
                    
                    string? logoUrl = null;

                    if (!string.IsNullOrEmpty(token.ContractAddress))
                    {
                        var normalizedAddress = token.ContractAddress.ToLowerInvariant();
                        if (tokenLogos.TryGetValue(normalizedAddress, out logoUrl) && !string.IsNullOrEmpty(logoUrl))
                        {
                            token.Logo = logoUrl;
                            continue;
                        }
                    }

                    if (!string.IsNullOrEmpty(token.Symbol) && !string.IsNullOrEmpty(token.Name))
                    {
                        var crossChainMetadata = await _metadataService.GetTokenMetadataBySymbolAndNameAsync(
                            token.Symbol, token.Name);
                        
                        if (crossChainMetadata?.LogoUrl != null)
                        {
                            token.Logo = crossChainMetadata.LogoUrl;
                            _logger.LogDebug("Applied logo by symbol+name cross-chain fallback - {Symbol}/{Name}", 
                                token.Symbol, token.Name);
                            continue;
                        }
                    }

                    if (!string.IsNullOrEmpty(token.Symbol))
                    {
                        var normalizedSymbol = token.Symbol.ToUpperInvariant();
                        if (symbolToLogo.TryGetValue(normalizedSymbol, out logoUrl) && !string.IsNullOrEmpty(logoUrl))
                        {
                            token.Logo = logoUrl;
                            _logger.LogDebug("Applied logo by symbol fallback - {Symbol}", token.Symbol);
                            continue;
                        }
                    }
                }
            }
        }
    }

    private static HashSet<string> ExtractUniqueTokens(IEnumerable<WalletItem> walletItems)
    {
        var uniqueTokens = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var walletItem in walletItems)
        {
            if (walletItem.Position?.Tokens != null)
            {
                foreach (var token in walletItem.Position.Tokens)
                {
                    if (!string.IsNullOrEmpty(token.ContractAddress))
                    {
                        uniqueTokens.Add(token.ContractAddress.ToLowerInvariant());
                    }
                }
            }
        }

        return uniqueTokens;
    }

    private static Dictionary<string, string> ExtractLogosFromTokens(IEnumerable<WalletItem> walletItems)
    {
        var tokenLogos = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var walletItem in walletItems)
        {
            if (walletItem.Position?.Tokens != null)
            {
                foreach (var token in walletItem.Position.Tokens)
                {
                    if (!string.IsNullOrEmpty(token.ContractAddress) && !string.IsNullOrEmpty(token.Logo))
                    {
                        var normalizedAddress = token.ContractAddress.ToLowerInvariant();
                        if (!tokenLogos.ContainsKey(normalizedAddress))
                        {
                            tokenLogos[normalizedAddress] = token.Logo;
                        }
                    }
                }
            }
        }

        return tokenLogos;
    }
}
