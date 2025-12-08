using ChainEnum = DeFi10.API.Models.Chain;

namespace DeFi10.API.Configuration;

public sealed class ProtocolChainResolved
{
    public string ProtocolId { get; }
    public ChainEnum Chain { get; }
    public bool Enabled { get; }
    public IReadOnlyDictionary<string, string> Options { get; }

    public ProtocolChainResolved(string protocolId, ChainEnum chain, IReadOnlyDictionary<string,string> options)
    {
        ProtocolId = protocolId;
        Chain = chain;
        Options = options;
        Enabled = options.TryGetValue("Enabled", out var enabled) && enabled.Equals("true", StringComparison.OrdinalIgnoreCase);
    }
}
