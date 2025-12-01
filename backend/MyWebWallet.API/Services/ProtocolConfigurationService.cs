using Microsoft.Extensions.Options;
using MyWebWallet.API.Configuration;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services;

public class ProtocolConfigurationService : IProtocolConfigurationService
{
    private readonly ProtocolConfigurationOptions _options;
    private readonly Dictionary<string, ProtocolDefinition> _map;
    private readonly ILogger<ProtocolConfigurationService> _logger;

    public ProtocolConfigurationService(IOptions<ProtocolConfigurationOptions> options, ILogger<ProtocolConfigurationService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _map = BuildMap(_options);
    }

    private static Dictionary<string, ProtocolDefinition> BuildMap(ProtocolConfigurationOptions opts)
    {
        var dict = new Dictionary<string, ProtocolDefinition>(StringComparer.OrdinalIgnoreCase);
        if (opts.AaveV3 != null) dict[nameof(opts.AaveV3)] = opts.AaveV3;
        if (opts.Moralis != null) dict[nameof(opts.Moralis)] = opts.Moralis;
        if (opts.UniswapV3 != null) dict[nameof(opts.UniswapV3)] = opts.UniswapV3;
        if (opts.PendleV2 != null) dict[nameof(opts.PendleV2)] = opts.PendleV2;
        if (opts.SolanaWallet != null) dict[nameof(opts.SolanaWallet)] = opts.SolanaWallet;
        if (opts.Raydium != null) dict[nameof(opts.Raydium)] = opts.Raydium;
        if (opts.Kamino != null) dict[nameof(opts.Kamino)] = opts.Kamino;

        foreach (var kv in opts.Extra)
        {
            if (!dict.ContainsKey(kv.Key)) dict[kv.Key] = kv.Value;
        }
        return dict;
    }

    public ProtocolDefinition? GetProtocol(string protocolId)
    {
        if (string.IsNullOrWhiteSpace(protocolId)) return null;
        return _map.TryGetValue(protocolId, out var def) ? def : null;
    }

    public IEnumerable<string> GetRegisteredProtocolIds() => _map.Keys;

    public IEnumerable<ProtocolChainResolved> GetEnabledChains(string protocolId)
    {
        var def = GetProtocol(protocolId);
        if (def == null) yield break;
        foreach (var support in def.ChainSupports)
        {
            if (!Enum.TryParse<ChainEnum>(support.Chain, true, out var chainEnum)) continue;
            yield return new ProtocolChainResolved(protocolId, chainEnum, support.Options);
        }
    }

    public IEnumerable<ChainEnum> GetAllConfiguredChains(string protocolId)
    {
        var def = GetProtocol(protocolId);
        if (def == null) yield break;
        foreach (var support in def.ChainSupports)
        {
            if (Enum.TryParse<ChainEnum>(support.Chain, true, out var chainEnum))
            {
                yield return chainEnum;
            }
        }
    }

    public ProtocolChainResolved? GetProtocolOnChain(string protocolId, ChainEnum chain)
    {
        var def = GetProtocol(protocolId);
        if (def == null) return null;
        var entry = def.ChainSupports.FirstOrDefault(c => string.Equals(c.Chain, chain.ToString(), StringComparison.OrdinalIgnoreCase));
        if (entry == null) return null;
        return new ProtocolChainResolved(protocolId, chain, entry.Options);
    }

    public bool IsProtocolEnabledOnChain(string protocolId, ChainEnum chain)
        => GetProtocolOnChain(protocolId, chain)?.Enabled == true;
}