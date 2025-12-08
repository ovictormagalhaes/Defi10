using System.Text.Json.Serialization;
using DeFi10.API.Services.Models.Aave.Borrows;

namespace DeFi10.API.Services.Models;

public class AaveGetUserBorrowsResponse
{
    [JsonPropertyName("data")]
    public UserBorrowsData Data { get; set; } = new();
}