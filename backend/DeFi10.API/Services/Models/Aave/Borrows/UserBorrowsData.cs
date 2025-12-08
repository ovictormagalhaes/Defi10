using System.Text.Json.Serialization;

namespace DeFi10.API.Services.Models.Aave.Borrows;

public class UserBorrowsData
{
    [JsonPropertyName("userBorrows")]
    public List<UserBorrow> UserBorrows { get; set; } = new();
}
