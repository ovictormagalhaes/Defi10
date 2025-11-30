using MyWebWallet.API.Messaging.Contracts.Enums;

namespace MyWebWallet.API.Messaging.Constants;

/// <summary>
/// Centralized routing keys for RabbitMQ messaging to avoid magic strings.
/// Implements Open/Closed Principle.
/// </summary>
public static class RoutingKeys
{
    // Integration patterns
    public const string IntegrationRequestPattern = "integration.request.*";
    public const string IntegrationResultPattern = "integration.result.*";
    
    // Aggregation patterns
    public const string AggregationStatusPattern = "aggregation.status.*";
    
    /// <summary>
    /// Generate routing key for integration request by provider
    /// </summary>
    public static string ForIntegrationRequest(IntegrationProvider provider) 
        => $"integration.request.{ProviderSlug(provider)}";
    
    /// <summary>
    /// Generate routing key for integration result by provider
    /// </summary>
    public static string ForIntegrationResult(IntegrationProvider provider) 
        => $"integration.result.{ProviderSlug(provider)}";
    
    /// <summary>
    /// Generate routing key for aggregation status
    /// </summary>
    public static string ForAggregationStatus(string jobId) 
        => $"aggregation.status.{jobId}";
    
    private static string ProviderSlug(IntegrationProvider provider) 
        => provider.ToString().ToLowerInvariant();
}
