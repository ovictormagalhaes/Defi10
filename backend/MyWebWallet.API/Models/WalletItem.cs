using System.Text.Json.Serialization;
using MyWebWallet.API.Models;

namespace MyWebWallet.API.Models;

public class WalletItem
{
    public WalletItemType Type { get; set; }

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

    public string Key => $"{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}-{Id?.ToLowerInvariant()}";
}

public class Position
{
    public string Label { get; set; }
    public List<Token> Tokens { get; set; }


    [JsonIgnore]
    public string? ProtocolKey { get; set; }
    public string Key => !string.IsNullOrEmpty(ProtocolKey) ? $"{ProtocolKey}-{Label?.ToLowerInvariant()}" : Label?.ToLowerInvariant() ?? "";
}

public class TokenFinancials
{
    public decimal? Amount { get; set; }
    public decimal? DecimalPlaces { get; set; }
    public decimal? AmountFormatted
    {
        get
        {
            if (Amount.HasValue && Amount.Value > 0 && DecimalPlaces.HasValue && DecimalPlaces.Value >= 0)
            {
                var places = (int)DecimalPlaces.Value;
                if (places <= MaxCachedPower)
                {
                    return Amount.Value / DecimalPow10(places);
                }

                return Amount.Value / DecimalPow10(MaxCachedPower);
            }
            return null;
        }
    }
    public decimal? BalanceFormatted { get; set; }
    public decimal? Price { get; set; }
    public decimal? TotalPrice { get; set; }

    private const int MaxCachedPower = 28;
    private static readonly decimal[] Pow10Cache = BuildCache();
    private static decimal[] BuildCache()
    {
        var arr = new decimal[MaxCachedPower + 1];
        arr[0] = 1m;
        for (int i = 1; i < arr.Length; i++) arr[i] = arr[i - 1] * 10m;
        return arr;
    }
    public static decimal DecimalPow10(int n)
    {
        if (n < 0) return 1m;
        if (n <= MaxCachedPower) return Pow10Cache[n];

        return Pow10Cache[MaxCachedPower];
    }
}

public class Token
{
    public TokenType? Type { get; set; }
    public string Name { get; set; }
    public string Chain { get; set; }
    public string Symbol { get; set; }
    public string ContractAddress { get; set; }
    public string? Logo { get; set; }
    public string Thumbnail { get; set; }
    public TokenFinancials Financials { get; set; } = new();
    public bool? Native { get; set; }
    public bool? PossibleSpam { get; set; }


    [JsonIgnore]
    public string? PositionKey { get; set; }
    public string Key => !string.IsNullOrEmpty(PositionKey) 
        ? $"{PositionKey}-{Type?.ToString().ToLowerInvariant()}-{Symbol?.ToLowerInvariant()}-{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}"
        : $"{Type?.ToString().ToLowerInvariant()}-{Symbol?.ToLowerInvariant()}-{Name?.ToLowerInvariant()}-{Chain?.ToLowerInvariant()}";
}

public class AdditionalData
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? HealthFactor { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? IsCollateral { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? CanBeCollateral { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? TickSpacing { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? SqrtPriceX96 { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public long? CreatedAt { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public long? UnlockAt { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public RangeInfo? Range { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? PriceUnavailable { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Fees24h { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? TotalValueUsd { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Apr { get; set; }
}

public class RangeInfo
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Upper { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Lower { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? Current { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public bool? InRange { get; set; }
}