using System.Text.Json.Serialization;

namespace MyWebWallet.API.Models;

public class WalletItem
{
    public WalletItemType Type { get; set; }
    public Token Token { get; set; }

    //DeFi specific properties
    public Protocol Protocol { get; set; }
    public Position Position { get; set; }
    public AdditionalData AdditionalData { get; set; }
}

public class Protocol {
    public string Name { get; set; }
    public string Chain { get; set; }
    public string Id { get; set; }
    public string Url { get; set; }
    public string Logo { get; set; }
}

public class Position
{
    public string Label { get; set; }
    public decimal? Balance { get; set; }
    public decimal? TotalUnclaimed { get; set; }
    public List<Token> Tokens { get; set; }
}

public class Token
{
    public string Type { get; set; }
    public string Name { get; set; }
    public string Chain { get; set; }
    public string Symbol { get; set; }
    public string ContractAddress { get; set; }
    public string Logo { get; set; }
    public string Thumbnail { get; set; }
    public decimal? Balance { get; set; }
    public decimal? DecimalPlaces { get; set; }
    public decimal? BalanceFormatted { get; set; }
    public decimal? Price { get; set; }
    public decimal? TotalPrice { get; set; }
    public bool? Native { get; set; }
    public bool? PossibleSpam { get; set; }
}

public class AdditionalData
{
    //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    //public decimal? HealthFactor { get; set; }
}