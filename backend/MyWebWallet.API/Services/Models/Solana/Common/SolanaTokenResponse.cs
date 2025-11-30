using System.Text.Json.Serialization;

namespace MyWebWallet.API.Services.Models.Solana.Common;

public sealed class SolanaTokenResponse
{
    [JsonPropertyName("tokens")] 
    public List<SplToken> Tokens { get; set; } = new();
    
    [JsonPropertyName("nativeBalanceUsd")] 
    public decimal? NativeBalanceUsd { get; set; }
}
