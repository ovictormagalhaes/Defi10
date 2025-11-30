using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Configuration;

public static class ProtocolDefinitionExtensions
{


    public static Protocol ToProtocol(this ProtocolDefinition def, ChainEnum chain, IChainConfigurationService chainConfig)
    {
        if (def == null) throw new InvalidOperationException("Protocol definition is null");
        if (string.IsNullOrWhiteSpace(def.Key)) throw new InvalidOperationException("Protocol definition missing Key");
        if (string.IsNullOrWhiteSpace(def.DisplayName)) throw new InvalidOperationException($"Protocol {def.Key} missing DisplayName");
        if (string.IsNullOrWhiteSpace(def.Website)) throw new InvalidOperationException($"Protocol {def.Key} missing Website");
        if (string.IsNullOrWhiteSpace(def.Icon)) throw new InvalidOperationException($"Protocol {def.Key} missing Icon");

        var chainCfg = chainConfig.GetChainConfig(chain) ?? throw new InvalidOperationException($"Chain configuration missing for {chain}");
        var slug = !string.IsNullOrWhiteSpace(chainCfg.Slug) ? chainCfg.Slug! : chain.ToString().ToLowerInvariant();

        if (def.ChainSupports != null && def.ChainSupports.Count > 0)
        {
            var support = def.ChainSupports.FirstOrDefault(c => string.Equals(c.Chain, chain.ToString(), StringComparison.OrdinalIgnoreCase));
            if (support == null) throw new InvalidOperationException($"Protocol {def.Key} has no chain support entry for {chain}");
            if (!support.Enabled) throw new InvalidOperationException($"Protocol {def.Key} disabled on chain {chain}");
        }

        return new Protocol
        {
            Name = def.DisplayName!,
            Chain = slug,
            Id = def.Key!,
            Url = def.Website!,
            Logo = def.Icon!
        };
    }
}
