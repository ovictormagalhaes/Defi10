using MyWebWallet.API.Models;

namespace MyWebWallet.API.Services.Interfaces;

/// <summary>
/// Multi-chain wallet aggregation orchestration service.
/// Coordinates async aggregation jobs across EVM chains (Base, Arbitrum, Ethereum, BNB) and Solana.
/// </summary>
public interface IWalletAggregationService
{
    Task<WalletResponse> GetWalletTokensAsync(string account);
    bool IsValidAddress(string account);
    string NetworkName { get; }
}