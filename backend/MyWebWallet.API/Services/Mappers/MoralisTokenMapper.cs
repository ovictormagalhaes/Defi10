using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Models;
using MyWebWallet.API.Services.Interfaces;
using MyWebWallet.API.Configuration;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services.Mappers;

public class MoralisTokenMapper : IWalletItemMapper<IEnumerable<TokenDetail>>
{
    private readonly IChainConfigurationService _chainConfig;
    private readonly IProtocolConfigurationService _protocolConfig;

    public MoralisTokenMapper(IChainConfigurationService chainConfigurationService, IProtocolConfigurationService protocolConfigurationService)
    { _chainConfig = chainConfigurationService; _protocolConfig = protocolConfigurationService; }

    public bool SupportsChain(ChainEnum chain) => GetSupportedChains().Contains(chain);
    
    public IEnumerable<ChainEnum> GetSupportedChains() => 
        _protocolConfig.GetEnabledChainEnums(ProtocolNames.Moralis, "Solana");

    public Protocol GetProtocolDefinition(ChainEnum chain)
    {
        var def = _protocolConfig.GetProtocol(ProtocolNames.Moralis) ?? throw new InvalidOperationException($"Protocol definition not found: {ProtocolNames.Moralis}");
        return def.ToProtocol(chain, _chainConfig);
    }

    public async Task<List<WalletItem>> MapAsync(IEnumerable<TokenDetail> tokens, ChainEnum chain)
    {
        if (!SupportsChain(chain)) throw new NotSupportedException($"Chain {chain} is not supported by Moralis");
        var protocol = GetProtocolDefinition(chain);
        return await Task.FromResult(tokens?.Select(token =>
        {
            decimal.TryParse(token.Balance, out var balance);
            var decimals = token.Decimals ?? 1;
            var balanceFormatted = decimals > 0 ? balance / (decimal)Math.Pow(10, decimals) : balance;
            return new WalletItem
            {
                Type = WalletItemType.Wallet,
                Protocol = protocol,
                Position = new Position
                {
                    Label = "Wallet",
                    Tokens = new List<Token>
                    {
                        new Token
                        {
                            Name = token.Name,
                            Chain = protocol.Chain,
                            Symbol = token.Symbol,
                            ContractAddress = token.TokenAddress,
                            Logo = string.IsNullOrEmpty(token.Logo) ? token.Thumbnail : token.Logo,
                            Thumbnail = token.Thumbnail,
                            Financials = new TokenFinancials
                            {
                                Amount = balance,
                                DecimalPlaces = decimals,
                                BalanceFormatted = balanceFormatted,
                                Price = (decimal?)token.UsdPrice,
                                TotalPrice = (decimal?)token.UsdPrice * balanceFormatted
                            },
                            Native = token.VerifiedContract ? false : (bool?)null,
                            PossibleSpam = token.PossibleSpam
                        }
                    }
                }
            };
        })?.ToList() ?? new List<WalletItem>());
    }
}