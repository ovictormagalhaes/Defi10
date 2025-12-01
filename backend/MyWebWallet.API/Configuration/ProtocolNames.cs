namespace MyWebWallet.API.Configuration;

/// <summary>
/// Centralized protocol names for type-safe protocol configuration access.
/// Uses nameof() to ensure refactoring safety.
/// </summary>
public static class ProtocolNames
{
    public const string Moralis = nameof(ProtocolConfigurationOptions.Moralis);
    public const string AaveV3 = nameof(ProtocolConfigurationOptions.AaveV3);
    public const string UniswapV3 = nameof(ProtocolConfigurationOptions.UniswapV3);
    public const string PendleV2 = nameof(ProtocolConfigurationOptions.PendleV2);
    public const string Raydium = nameof(ProtocolConfigurationOptions.Raydium);
    public const string Kamino = nameof(ProtocolConfigurationOptions.Kamino);
    public const string SolanaWallet = nameof(ProtocolConfigurationOptions.SolanaWallet);
}
