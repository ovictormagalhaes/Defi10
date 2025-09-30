using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MyWebWallet.API.Messaging.Contracts;
using MyWebWallet.API.Messaging.Rabbit;
using RabbitMQ.Client;
using StackExchange.Redis;

namespace MyWebWallet.API.Messaging.Workers;

/// <summary>
/// Periodically scans aggregation jobs in Redis and marks overdue ones as TimedOut,
/// emitting a WalletAggregationCompleted event (status TimedOut).
/// </summary>
public class AggregationTimeoutMonitorWorker : BackgroundService
{
    private readonly ILogger<AggregationTimeoutMonitorWorker> _logger;
    private readonly IConnectionMultiplexer _redis;
    private readonly IMessagePublisher _publisher;
    private readonly TimeSpan _scanInterval;
    private readonly TimeSpan _jobTimeout; // Max age since created_at before timing out

    public AggregationTimeoutMonitorWorker(
        ILogger<AggregationTimeoutMonitorWorker> logger,
        IConnectionMultiplexer redis,
        IMessagePublisher publisher,
        IConfiguration configuration)
    {
        _logger = logger;
        _redis = redis;
        _publisher = publisher;
        _scanInterval = TimeSpan.FromSeconds(Math.Clamp(configuration.GetValue<int?>("Aggregation:TimeoutScanSeconds") ?? 30, 5, 300));
        _jobTimeout = TimeSpan.FromSeconds(Math.Clamp(configuration.GetValue<int?>("Aggregation:JobTimeoutSeconds") ?? 180, 30, 3600));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AggregationTimeoutMonitorWorker started scanInterval={Scan}s jobTimeout={Timeout}s", _scanInterval.TotalSeconds, _jobTimeout.TotalSeconds);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ScanAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Timeout scan cycle failed");
            }
            await Task.Delay(_scanInterval, stoppingToken);
        }
    }

    private async Task ScanAsync(CancellationToken ct)
    {
        var endpoints = _redis.GetEndPoints();
        if (endpoints.Length == 0) return;
        var server = _redis.GetServer(endpoints[0]);
        var db = _redis.GetDatabase();
        var now = DateTime.UtcNow;

        // Pattern: wallet:agg:*:meta
        foreach (var key in server.Keys(pattern: "wallet:agg:*:meta"))
        {
            ct.ThrowIfCancellationRequested();
            try
            {
                var metaEntries = await db.HashGetAllAsync(key);
                if (metaEntries.Length == 0) continue;
                var meta = metaEntries.ToDictionary(x => x.Name.ToString(), x => x.Value.ToString());
                if (!meta.TryGetValue("status", out var statusStr)) continue;
                if (!meta.TryGetValue("created_at", out var createdStr)) continue;
                if (!meta.TryGetValue("final_emitted", out var finalEmittedStr)) finalEmittedStr = "0";

                if (finalEmittedStr == "1") continue; // already finalized

                if (!Enum.TryParse<AggregationStatus>(statusStr, true, out var aggStatus)) continue;
                if (aggStatus is AggregationStatus.Completed or AggregationStatus.CompletedWithErrors or AggregationStatus.TimedOut or AggregationStatus.Cancelled)
                    continue; // finished states

                if (!DateTime.TryParse(createdStr, out var createdAt)) continue;
                var age = now - createdAt;
                if (age < _jobTimeout) continue; // not expired yet

                // Derive jobId from key: wallet:agg:{jobId}:meta
                var parts = key.ToString().Split(':', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 3) continue;
                var jobIdStr = parts[2];
                if (!Guid.TryParse(jobIdStr, out var jobId)) continue;

                // Pending providers length
                var pendingKey = $"wallet:agg:{jobId}:pending";
                var pendingCount = (int)await db.SetLengthAsync(pendingKey);

                // Avoid race: re-check final_emitted just before updating
                var finalCheck = await db.HashGetAsync(key, "final_emitted");
                if (finalCheck == "1") continue;

                // Mark timed out - increment timed_out by remaining pending, set status + final_emitted
                var tran = db.CreateTransaction();
                if (pendingCount > 0)
                {
                    tran.HashIncrementAsync(key, "timed_out", pendingCount);
                }
                tran.HashSetAsync(key, new HashEntry[]
                {
                    new("status", AggregationStatus.TimedOut.ToString()),
                    new("final_emitted", 1)
                });
                var exec = await tran.ExecuteAsync();
                if (!exec)
                {
                    _logger.LogWarning("Transaction failed marking timeout jobId={JobId}", jobId);
                    continue;
                }

                // Gather counts for event
                int succeeded = (int)(long)(await db.HashGetAsync(key, "succeeded"));
                int failed = (int)(long)(await db.HashGetAsync(key, "failed"));
                int timedOut = (int)(long)(await db.HashGetAsync(key, "timed_out"));
                int expected = (int)(long)(await db.HashGetAsync(key, "expected_total"));
                var account = await db.HashGetAsync(key, "account");

                var evt = new WalletAggregationCompleted(
                    JobId: jobId,
                    Account: account,
                    Status: AggregationStatus.TimedOut,
                    CompletedAtUtc: DateTime.UtcNow,
                    Total: expected,
                    Succeeded: succeeded,
                    Failed: failed,
                    TimedOut: timedOut
                );
                _logger.LogWarning("Job timed out jobId={JobId} expected={Expected} succ={Succ} fail={Fail} timedOut={TO}", jobId, expected, succeeded, failed, timedOut);
                await _publisher.PublishAsync("aggregation.completed", evt, ct);
            }
            catch (Exception exInner)
            {
                _logger.LogError(exInner, "Failed processing meta key {Key}", key);
            }
        }
    }
}
