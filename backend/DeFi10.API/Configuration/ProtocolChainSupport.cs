using DeFi10.API.Models;

namespace DeFi10.API.Configuration;

public class ProtocolChainSupport
{
    public string Chain { get; set; } = string.Empty;
    public Dictionary<string, string> Options { get; set; } = new();
}
