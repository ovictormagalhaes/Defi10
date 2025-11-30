using System.Text.Json;

namespace MyWebWallet.API.Infrastructure.Http;

/// <summary>
/// Base class for HTTP-based services to eliminate duplicated HTTP client code.
/// Implements DRY principle for HTTP operations.
/// </summary>
public abstract class BaseHttpService
{
    protected readonly HttpClient HttpClient;
    protected readonly ILogger Logger;
    protected readonly JsonSerializerOptions JsonOptions;

    protected BaseHttpService(HttpClient httpClient, ILogger logger)
    {
        HttpClient = httpClient;
        Logger = logger;
        JsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
    }

    /// <summary>
    /// Generic GET request with automatic deserialization and error handling
    /// </summary>
    protected async Task<TResponse> GetAsync<TResponse>(
        string url,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        ConfigureHeaders(headers);
        
        var response = await HttpClient.GetAsync(url, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            Logger.LogError(
                "HTTP request failed - URL: {Url}, Status: {StatusCode}, Content: {ErrorContent}",
                url, response.StatusCode, errorContent);
            response.EnsureSuccessStatusCode();
        }

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<TResponse>(json, JsonOptions) 
            ?? throw new InvalidOperationException($"Failed to deserialize {typeof(TResponse).Name}");
    }

    /// <summary>
    /// Generic GET request that returns null on failure instead of throwing
    /// </summary>
    protected async Task<TResponse?> TryGetAsync<TResponse>(
        string url,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default) where TResponse : class
    {
        try
        {
            return await GetAsync<TResponse>(url, headers, cancellationToken);
        }
        catch (Exception ex)
        {
            Logger.LogWarning(ex, "TryGetAsync failed for {Url}, returning null", url);
            return null;
        }
    }

    /// <summary>
    /// Generic POST request with automatic serialization and deserialization
    /// </summary>
    protected async Task<TResponse> PostAsync<TRequest, TResponse>(
        string url,
        TRequest payload,
        Dictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        ConfigureHeaders(headers);
        
        var json = JsonSerializer.Serialize(payload, JsonOptions);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        
        var response = await HttpClient.PostAsync(url, content, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            Logger.LogError(
                "HTTP POST failed - URL: {Url}, Status: {StatusCode}, Content: {ErrorContent}",
                url, response.StatusCode, errorContent);
            response.EnsureSuccessStatusCode();
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<TResponse>(responseJson, JsonOptions) 
            ?? throw new InvalidOperationException($"Failed to deserialize {typeof(TResponse).Name}");
    }

    private void ConfigureHeaders(Dictionary<string, string>? headers)
    {
        HttpClient.DefaultRequestHeaders.Clear();
        HttpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        
        if (headers != null)
        {
            foreach (var (key, value) in headers)
            {
                HttpClient.DefaultRequestHeaders.Add(key, value);
            }
        }
    }
}
