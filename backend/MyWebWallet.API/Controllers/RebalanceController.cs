using Microsoft.AspNetCore.Mvc;
using MyWebWallet.API.DTOs;
using MyWebWallet.API.Services.Interfaces;

namespace MyWebWallet.API.Controllers;

[ApiController]
[Route("api/v1/rebalances")]
public class RebalanceController : ControllerBase
{
    private readonly IRebalanceService _rebalanceService;

    public RebalanceController(IRebalanceService rebalanceService)
    {
        _rebalanceService = rebalanceService;
    }

    // Save targets for one or many accounts
    [HttpPost]
    public async Task<ActionResult<RebalanceSavedResponse>> Save([FromBody] RebalanceRequest request)
    {
        if (request == null) return BadRequest(new { error = "Request body is required" });
        var items = request.Items ?? new List<RebalanceItem>();
        if (items.Count == 0) return BadRequest(new { error = "Items are required" });

        var accounts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.AccountId)) accounts.Add(request.AccountId!);
        if (request.AccountIds != null && request.AccountIds.Count > 0) accounts.AddRange(request.AccountIds);
        accounts = accounts.Select(a => a.Trim()).Where(a => !string.IsNullOrWhiteSpace(a)).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        if (accounts.Count == 0) return BadRequest(new { error = "At least one accountId is required" });

        if (accounts.Count == 1)
        {
            await _rebalanceService.SaveAsync(accounts[0], items);
            var key = _getKey(accounts[0]);
            return Ok(new RebalanceSavedResponse { Key = key, ItemsCount = items.Count, Accounts = accounts, SavedAt = DateTime.UtcNow });
        }
        else
        {
            await _rebalanceService.SaveManyAsync(accounts, items);
            return Ok(new RebalanceSavedResponse { Key = "(multiple)", ItemsCount = items.Count, Accounts = accounts, SavedAt = DateTime.UtcNow });
        }
    }

    // Get targets for a single account
    [HttpGet("{accountId}")]
    public async Task<ActionResult<object>> Get(string accountId)
    {
        if (string.IsNullOrWhiteSpace(accountId)) return BadRequest(new { error = "accountId is required" });
        var items = await _rebalanceService.GetAsync(accountId);
        if (items == null) return NotFound(new { accountId, message = "No rebalancing data found" });
        return Ok(new { accountId, items, count = items.Count, key = _getKey(accountId) });
    }

    private string _getKey(string accountId)
    {
        // Compose the same key as service/cache
        return HttpContext.RequestServices.GetRequiredService<ICacheService>().GenerateRebalanceCacheKey(accountId);
    }
}
