using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Models;
using ChainEnum = MyWebWallet.API.Models.Chain;
using MyWebWallet.API.Aggregation;

namespace MyWebWallet.API.Services.Mappers;

public class AaveBorrowsMapper : IWalletItemMapper<AaveGetUserBorrowsResponse>
{
    private readonly ITokenFactory _tokenFactory;
    public AaveBorrowsMapper(ITokenFactory tokenFactory)
    {
        _tokenFactory = tokenFactory;
    }

    public string ProtocolName => "Aave-Borrows";
    public string GetProtocolName() => ProtocolName;

    public bool SupportsChain(ChainEnum chain)
    {
        return GetSupportedChains().Contains(chain);
    }

    public IEnumerable<ChainEnum> GetSupportedChains()
    {
        return new[] { ChainEnum.Base };
    }

    public async Task<List<WalletItem>> MapAsync(AaveGetUserBorrowsResponse response, ChainEnum chain)
    {
        if (!SupportsChain(chain))
            throw new NotSupportedException($"Chain {chain} is not supported by {GetProtocolName()}");

        return await Task.FromResult(response?.Data?.UserBorrows?.Select(supply =>
        {
            decimal.TryParse(supply.Debt.Amount.Value, out var amountFormatted);
            decimal.TryParse(supply.Debt.Usd, out var totalPrice);
            var unitPrice = amountFormatted > 0 ? totalPrice / amountFormatted : 0m;

            var borrowedToken = _tokenFactory.CreateBorrowed(
                supply.Currency.Name,
                supply.Currency.Symbol,
                supply.Currency.Address,
                chain,
                0, // decimals unknown in payload
                amountFormatted,
                unitPrice);

            return new WalletItem
            {
                Type = WalletItemType.LendingAndBorrowing,
                Protocol = GetProtocol(chain),
                Position = new Position
                {
                    Label = "Borrowed",
                    Tokens = new List<Token> { borrowedToken }
                },
                AdditionalData = new AdditionalData()
            };
        }).ToList() ?? []);
    }

    private static Protocol GetProtocol(ChainEnum chain) => new()
    {
        Name = "Aave V3",
        Chain = chain.ToChainId(),
        Id = "aave-v3",
        Url = "https://app.aave.com",
        Logo = "https://cdn.moralis.io/defi/aave.png"
    };
}