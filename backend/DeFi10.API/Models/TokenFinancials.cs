namespace DeFi10.API.Models;

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
