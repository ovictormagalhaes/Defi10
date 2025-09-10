using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;
using MyWebWallet.API.Services.Models;
using System.Reflection.Emit;
using System.Text.RegularExpressions;

namespace MyWebWallet.API.Services;

public class EthereumService : IBlockchainService
{
    private readonly IMoralisService _moralisService;
    private readonly IConfiguration _configuration;

    public string NetworkName => "Ethereum";

    public EthereumService(IMoralisService moralisService, IConfiguration configuration)
    {
        _moralisService = moralisService;
        _configuration = configuration;
    }

    public bool IsValidAddress(string account)
    {
        // Ethereum address validation (42 characters, starts with 0x)
        return Regex.IsMatch(account, @"^0x[a-fA-F0-9]{40}$");
    }

    public async Task<WalletResponse> GetWalletTokensAsync(string account)
    {
        if (!IsValidAddress(account))
        {
            throw new ArgumentException("Invalid Ethereum address");
        }

        try
        {
            Console.WriteLine($"Fetching tokens for wallet: {account} on Base chain");

            // Fetch tokens and map them
            var baseChainId = "base"; // Hardcoded for now
            var tokens = await _moralisService.GetERC20TokenBalanceAsync(account, baseChainId);
            Console.WriteLine($"Tokens fetched: {tokens.Result?.Count}"); // Debugging
            var items = new List<WalletItem>();
            items.AddRange(MapTokens(tokens.Result, baseChainId));

            // Fetch DeFi positions and map them
            var defi = await _moralisService.GetDeFiPositionsAsync(account, baseChainId);
            Console.WriteLine($"DeFi positions fetched: {defi?.Count}"); // Debugging
            items.AddRange(MapDeFiPositions(defi, baseChainId));

            return new WalletResponse
            {
                Account = account,
                Items = items,
                Network = NetworkName,
                LastUpdated = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching wallet data from Base chain: {ex.Message}");
            throw;
        }
    }

    private List<WalletItem> MapTokens(IEnumerable<TokenDetail> items, string chain)
    {
        return items?.Select(token =>
        {
            decimal.TryParse(token.Balance, out var balance);

            var decimals = token.Decimals ?? 1;
            var balanceFormatted = balance / (decimal)Math.Pow(10, token.Decimals ?? 1);
            return new WalletItem()
            {

                Type = WalletItemType.Wallet,
                Token = new Token
                {
                    Name = token.Name,
                    Chain = chain,
                    Symbol = token.Symbol,
                    ContractAddress = token.TokenAddress,
                    Logo = string.IsNullOrEmpty(token.Logo) ? token.Thumbnail : token.Logo,
                    Thumbnail = token.Thumbnail,
                    Balance = balance,
                    DecimalPlaces = decimals,
                    BalanceFormatted = balanceFormatted,
                    Price = (decimal?)token.UsdPrice,
                    TotalPrice = (decimal?)token.UsdPrice * balanceFormatted,
                    Native = token.VerifiedContract ? false : (bool?)null,
                    PossibleSpam = token.PossibleSpam
                }
            };
        })?.ToList() ?? [];
    }

    private List<WalletItem> MapDeFiPositions(IEnumerable<GetDeFiPositionsMoralisInfo> items, string chain)
    {
        return items?.Select(d =>
        {
            var label = d.Position?.Label?.ToLowerInvariant();

            var walletItemType = label switch
            {
                "liquidity" => WalletItemType.LiquidityPool,
                "supplied" or "borrowed" => WalletItemType.LendingAndBorrowing,
                "staking" => WalletItemType.Staking,
                _ => WalletItemType.Other,
            };

            return new WalletItem
            {
                Type = walletItemType,
                Protocol = new Protocol
                {
                    Name = d.ProtocolName,
                    Chain = chain,
                    Id = d.ProtocolId,
                    Url = d.ProtocolUrl,
                    Logo = d.ProtocolLogo
                },
                Position = new Position
                {
                    Label = d.Position.Label,
                    Balance = d.Position.BalanceUsd,
                    TotalUnclaimed = d.Position.TotalUnclaimedUsdValue,
                    Tokens = d.Position.Tokens.Select(t =>
                    {
                        var balance = t.Balance != null ? decimal.Parse(t.Balance) : 0;
                        var decimalPlaces = int.TryParse(t.Decimals, out var decimals) ? decimals : 0;
                        var balanceFormatted = balance / (decimal)Math.Pow(10, decimalPlaces);

                        return new Token
                        {
                            Type = t.TokenType,
                            Name = t.Name,
                            Symbol = t.Symbol,
                            ContractAddress = t.ContractAddress,
                            DecimalPlaces = decimalPlaces,
                            Logo = t.Logo,
                            Thumbnail = t.Thumbnail,
                            Balance = balance,
                            BalanceFormatted = balanceFormatted,
                            Price = t.UsdPrice,
                            TotalPrice = t.UsdValue
                        };
                    }).ToList()
                },
                AdditionalData = new AdditionalData
                {
                    //HealthFactor = d.AccountData?.HealthFactory != null && decimal.TryParse(d.AccountData.HealthFactory, out var healthFactor) ? healthFactor : null
                }
            };
        })?.ToList() ?? [];
    }
}