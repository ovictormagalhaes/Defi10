namespace DeFi10.API.Models;

public class SupportedChainsResponse
{
    public List<SupportedChainResponse> Chains { get; set; } = new();
    public int Count => Chains.Count;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
