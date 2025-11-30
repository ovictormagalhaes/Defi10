using MyWebWallet.API.Models;

namespace MyWebWallet.API.Configuration;

public class ProtocolChainSupport
{
    public string Chain { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public Dictionary<string, string> Settings { get; set; } = new();
}
