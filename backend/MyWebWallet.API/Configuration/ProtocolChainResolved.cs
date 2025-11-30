using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Configuration;

public sealed class ProtocolChainResolved
{
    public string ProtocolId { get; }
    public ChainEnum Chain { get; }
    public bool Enabled { get; }
    public IReadOnlyDictionary<string, string> Settings { get; }

    public ProtocolChainResolved(string protocolId, ChainEnum chain, bool enabled, IReadOnlyDictionary<string,string> settings)
    {
        ProtocolId = protocolId;
        Chain = chain;
        Enabled = enabled;
        Settings = settings;
    }
}
