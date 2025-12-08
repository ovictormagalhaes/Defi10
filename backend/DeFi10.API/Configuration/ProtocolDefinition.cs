namespace DeFi10.API.Configuration;

public class ProtocolDefinition
{
    public string? Key { get; set; }
    public List<string>? Aliases { get; set; }
    public string? DisplayName { get; set; }
    public string? Icon { get; set; }
    public string? Website { get; set; }
    public string? Documentation { get; set; }
    public List<ProtocolChainSupport> ChainSupports { get; set; } = new();
    public Dictionary<string, string>? Metadata { get; set; }
}
