using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Aave.Borrows;

public class UserBorrowsData
{
    [JsonPropertyName("userBorrows")]
    public List<UserBorrow> UserBorrows { get; set; } = new();
}
