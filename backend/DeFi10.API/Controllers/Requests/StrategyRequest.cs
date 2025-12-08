using DeFi10.API.Models;
using System.ComponentModel.DataAnnotations;

namespace DeFi10.API.Controllers.Requests;

public class StrategyRequest
{
    [Required]
    public Guid WalletGroupId { get; set; }

    [Required]
    public List<StrategyItem> Items { get; set; } = new();
}
