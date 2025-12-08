namespace DeFi10.API.Controllers.Requests;

public sealed class AggregationStartRequest
{
    public string? Account { get; set; }

    public Guid? WalletGroupId { get; set; }
    
    public string[]? Chains { get; set; }
}
