using System.ComponentModel.DataAnnotations;

namespace DeFi10.API.Controllers.Requests;

public sealed class UpdateWalletGroupRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one wallet address is required")]
    [MaxLength(3, ErrorMessage = "Maximum of 3 wallet addresses allowed")]
    public List<string> Wallets { get; set; } = new();

    [MaxLength(100)]
    public string? DisplayName { get; set; }
}
