using System.Net.Http.Headers;
using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services;

public sealed class CoinMarketCapOptions
{
    public string? ApiKey { get; set; }
    public string BaseUrl { get; set; } = "https://pro-api.coinmarketcap.com/v1";
    public bool Enabled { get; set; } = true;
    public int TimeoutMs { get; set; } = 5000;
}

public class CoinMarketCapService : ICoinMarketCapService
{
    private readonly HttpClient _http;
    private readonly ILogger<CoinMarketCapService> _logger;
    private readonly CoinMarketCapOptions _opts;

    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public CoinMarketCapService(HttpClient http, IOptions<CoinMarketCapOptions> options, ILogger<CoinMarketCapService> logger)
    {
        _http = http;
        _logger = logger;
        _opts = options.Value;
        if (_opts.Enabled && !string.IsNullOrWhiteSpace(_opts.ApiKey))
        {
            _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (!_http.DefaultRequestHeaders.Contains("X-CMC_PRO_API_KEY"))
                _http.DefaultRequestHeaders.Add("X-CMC_PRO_API_KEY", _opts.ApiKey);
            _http.Timeout = TimeSpan.FromMilliseconds(_opts.TimeoutMs);
        }
        else
        {
            _opts.Enabled = false;
            _logger.LogWarning("CoinMarketCap service disabled (missing api key or disabled flag)");
        }
    }

    public async Task<decimal?> GetPriceUsdAsync(string symbol, ChainEnum? chain = null, CancellationToken ct = default)
    {
        if (!_opts.Enabled || string.IsNullOrWhiteSpace(symbol)) return null;
        var res = await GetPricesUsdAsync(new[] { symbol }, ct);
        return res.TryGetValue(symbol, out var price) ? price : null;
    }

    public async Task<IDictionary<string, decimal?>> GetPricesUsdAsync(IEnumerable<string> symbols, CancellationToken ct = default)
    {
        var list = symbols.Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (!_opts.Enabled || list.Length == 0)
            return list.ToDictionary(s => s, _ => (decimal?)null, StringComparer.OrdinalIgnoreCase);

        var joined = string.Join(',', list.Select(s => s.ToUpperInvariant()));
        var url = $"{_opts.BaseUrl}/cryptocurrency/quotes/latest?symbol={joined}";
        try
        {
            using var resp = await _http.GetAsync(url, ct);
            if (resp.StatusCode == (HttpStatusCode)429)
            {
                _logger.LogWarning("CMC rate limited 429 symbols={Count}", list.Length);
                return list.ToDictionary(s => s, _ => (decimal?)null, StringComparer.OrdinalIgnoreCase);
            }
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("CMC failure status={Status} symbols={Count}", resp.StatusCode, list.Length);
                return list.ToDictionary(s => s, _ => (decimal?)null, StringComparer.OrdinalIgnoreCase);
            }
            await using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            if (!doc.RootElement.TryGetProperty("data", out var data))
                return list.ToDictionary(s => s, _ => (decimal?)null, StringComparer.OrdinalIgnoreCase);
            var result = new Dictionary<string, decimal?>(StringComparer.OrdinalIgnoreCase);
            foreach (var s in list)
            {
                decimal? price = null;
                if (data.TryGetProperty(s.ToUpperInvariant(), out var sym) &&
                    sym.TryGetProperty("quote", out var quote) &&
                    quote.TryGetProperty("USD", out var usd) &&
                    usd.TryGetProperty("price", out var priceEl) && priceEl.TryGetDecimal(out var p))
                {
                    price = p;
                }
                result[s] = price;
            }
            return result;
        }
        catch (TaskCanceledException) when (ct.IsCancellationRequested)
        {
            _logger.LogInformation("CMC request canceled symbols={Count}", list.Length);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CMC exception symbols={Count}", list.Length);
            return list.ToDictionary(s => s, _ => (decimal?)null, StringComparer.OrdinalIgnoreCase);
        }
    }
}
