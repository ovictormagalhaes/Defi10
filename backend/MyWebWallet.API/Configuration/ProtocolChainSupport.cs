using MyWebWallet.API.Models;

namespace MyWebWallet.API.Configuration;

public class ProtocolChainSupport
{
    public string Chain { get; set; } = string.Empty;
    public Dictionary<string, string> Options { get; set; } = new();
}
