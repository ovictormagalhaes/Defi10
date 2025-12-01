using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Configuration;

public static class ProtocolConfigurationExtensions
{
    /// <summary>
    /// Gets all enabled chain enums for a protocol from configuration.
    /// </summary>
    /// <param name="protocolConfig">The protocol configuration service</param>
    /// <param name="protocolName">The protocol name (use ProtocolNames constants)</param>
    /// <param name="excludeChains">Optional chains to exclude (e.g., exclude Solana for EVM-only protocols)</param>
    /// <returns>Array of enabled chain enums for the protocol</returns>
    public static ChainEnum[] GetEnabledChainEnums(
        this IProtocolConfigurationService protocolConfig, 
        string protocolName,
        params string[] excludeChains)
    {
        var def = protocolConfig.GetProtocol(protocolName);
        if (def?.ChainSupports == null) return Array.Empty<ChainEnum>();
        
        var query = def.ChainSupports.AsEnumerable();
        
        // Exclude specific chains if provided
        if (excludeChains?.Length > 0)
        {
            query = query.Where(cs => !excludeChains.Contains(cs.Chain, StringComparer.OrdinalIgnoreCase));
        }
        
        return query
            .Where(cs => cs.Options?.TryGetValue("Enabled", out var enabled) == true && 
                        enabled.Equals("true", StringComparison.OrdinalIgnoreCase))
            .Select(cs => Enum.Parse<ChainEnum>(cs.Chain, ignoreCase: true))
            .ToArray();
    }
    
    /// <summary>
    /// Checks if a specific chain is enabled for a protocol.
    /// </summary>
    public static bool IsChainEnabledForProtocol(
        this IProtocolConfigurationService protocolConfig,
        string protocolName,
        ChainEnum chain)
    {
        return protocolConfig.GetEnabledChainEnums(protocolName).Contains(chain);
    }
}
