using System.ComponentModel.DataAnnotations;

namespace DeFi10.API.Controllers.Requests;

public sealed class CreateWalletGroupRequest
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one wallet address is required")]
    [MaxLength(3, ErrorMessage = "Maximum of 3 wallet addresses allowed")]
    public List<string> Wallets { get; set; } = new();

    [MaxLength(100)]
    public string? DisplayName { get; set; }

    // Campos para autenticação com PoW + senha
    public string? Password { get; set; }
    public string? Challenge { get; set; }
    public string? Nonce { get; set; }
}
