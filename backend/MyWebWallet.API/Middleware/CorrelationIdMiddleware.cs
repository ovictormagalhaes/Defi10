using System.Diagnostics;

namespace MyWebWallet.API.Middleware;

/// <summary>
/// Correlation ID middleware that assigns a unique ID to each request
/// for distributed tracing and log aggregation.
/// </summary>
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware> _logger;
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public CorrelationIdMiddleware(
        RequestDelegate next,
        ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Try to get correlation ID from request header, or generate a new one
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
                            ?? Guid.NewGuid().ToString();

        // Store in HttpContext for access by other middleware/controllers
        context.Items["CorrelationId"] = correlationId;

        // Add to response headers for client tracking
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        // Create activity for distributed tracing
        using var activity = Activity.Current?.Source.StartActivity("HttpRequest");
        activity?.SetTag("correlation_id", correlationId);
        activity?.SetTag("http.method", context.Request.Method);
        activity?.SetTag("http.path", context.Request.Path);
        activity?.SetTag("http.host", context.Request.Host.Value);

        // Use log scope to include correlation ID in all logs for this request
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["RequestPath"] = context.Request.Path.Value ?? "",
            ["RequestMethod"] = context.Request.Method
        }))
        {
            _logger.LogInformation(
                "Request started: {Method} {Path} - CorrelationId: {CorrelationId}",
                context.Request.Method,
                context.Request.Path,
                correlationId);

            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();

                _logger.LogInformation(
                    "Request completed: {Method} {Path} - Status: {StatusCode} - Duration: {Duration}ms - CorrelationId: {CorrelationId}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds,
                    correlationId);

                activity?.SetTag("http.status_code", context.Response.StatusCode);
                activity?.SetTag("duration_ms", stopwatch.ElapsedMilliseconds);
            }
        }
    }
}

/// <summary>
/// Extension method to register the correlation ID middleware
/// </summary>
public static class CorrelationIdMiddlewareExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CorrelationIdMiddleware>();
    }
}
