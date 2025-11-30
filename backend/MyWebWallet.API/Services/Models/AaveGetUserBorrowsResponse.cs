using System.Text.Json.Serialization;
using MyWebWallet.API.Services.Models.Aave.Borrows;

namespace MyWebWallet.API.Services.Models;

public class AaveGetUserBorrowsResponse
{
    [JsonPropertyName("data")]
    public UserBorrowsData Data { get; set; } = new();
}