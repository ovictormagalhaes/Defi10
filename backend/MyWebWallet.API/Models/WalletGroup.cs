using System.ComponentModel.DataAnnotations;

namespace MyWebWallet.API.Models;


public sealed class WalletGroup
{


    public Guid Id { get; set; }


    [Required]
    [MinLength(1, ErrorMessage = "At least one wallet address is required")]
    [MaxLength(3, ErrorMessage = "Maximum of 3 wallet addresses allowed")]
    public List<string> Wallets { get; set; } = new();


    [MaxLength(100)]
    public string? DisplayName { get; set; }


    public string? PasswordHash { get; set; }


    public DateTime CreatedAt { get; set; }


    public DateTime UpdatedAt { get; set; }
}
