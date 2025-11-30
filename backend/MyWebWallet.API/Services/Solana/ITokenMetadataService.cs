namespace MyWebWallet.API.Services.Solana;


public interface ITokenMetadataService
{


    Task<TokenMetadata?> GetTokenMetadataAsync(string mintAddress);


    Task<TokenMetadata?> GetTokenMetadataBySymbolAndNameAsync(string symbol, string name);


    Task<decimal?> GetTokenPriceAsync(string identifier);


    Task SetTokenMetadataAsync(string mintAddress, TokenMetadata metadata);


    Task SetTokenPriceAsync(string identifier, decimal priceUsd);
}

public sealed class TokenMetadata
{
    public string Symbol { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}
