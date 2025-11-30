using Microsoft.AspNetCore.Mvc;
using MyWebWallet.API.DTOs;
using MyWebWallet.API.Services.Interfaces;

namespace MyWebWallet.API.Controllers;

[ApiController]
[Route("api/v1/rebalances")]
public class RebalanceController : ControllerBase
{
    private readonly IRebalanceService _rebalanceService;
    private readonly IWalletGroupService _walletGroupService;

    public RebalanceController(
        IRebalanceService rebalanceService,
        IWalletGroupService walletGroupService)
    {
        _rebalanceService = rebalanceService;
        _walletGroupService = walletGroupService;
    }

    // Save targets for one or many accounts
    [HttpPost]
    public async Task<ActionResult<RebalanceSavedResponse>> Save([FromBody] RebalanceRequest request)
    {
        if (request == null) return BadRequest(new { error = "Request body is required" });
        var items = request.Items ?? new List<RebalanceItem>();
        if (items.Count == 0) return BadRequest(new { error = "Items are required" });

        var accounts = new List<string>();
        
        // Option 1: Load accounts from wallet group
        if (request.WalletGroupId.HasValue)
        {
            var walletGroup = await _walletGroupService.GetAsync(request.WalletGroupId.Value);
            if (walletGroup == null)
            {
                return NotFound(new { error = $"Wallet group {request.WalletGroupId.Value} not found" });
            }
            accounts.AddRange(walletGroup.Wallets);
        }
        
        // Option 2: Use provided account IDs
        if (!string.IsNullOrWhiteSpace(request.AccountId)) accounts.Add(request.AccountId!);
        if (request.AccountIds != null && request.AccountIds.Count > 0) accounts.AddRange(request.AccountIds);
        
        // Clean up and deduplicate
        accounts = accounts.Select(a => a.Trim()).Where(a => !string.IsNullOrWhiteSpace(a)).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        if (accounts.Count == 0)
        {
            return BadRequest(new { error = "At least one accountId or walletGroupId is required" });
        }

        if (accounts.Count == 1)
        {
            await _rebalanceService.SaveAsync(accounts[0], items);
            var key = _getKey(accounts[0]);
            return Ok(new RebalanceSavedResponse { Key = key, ItemsCount = items.Count, Accounts = accounts, SavedAt = DateTime.UtcNow });
        }
        else
        {
            // If walletGroupId was provided, save with single group key
            if (request.WalletGroupId.HasValue)
            {
                await _rebalanceService.SaveForWalletGroupAsync(request.WalletGroupId.Value, items);
                return Ok(new RebalanceSavedResponse 
                { 
                    Key = request.WalletGroupId.Value.ToString(), 
                    ItemsCount = items.Count, 
                    Accounts = accounts, 
                    SavedAt = DateTime.UtcNow 
                });
            }
            else
            {
                // Multiple accounts without wallet group - save individually
                await _rebalanceService.SaveManyAsync(accounts, items);
                return Ok(new RebalanceSavedResponse 
                { 
                    Key = "(multiple)", 
                    ItemsCount = items.Count, 
                    Accounts = accounts, 
                    SavedAt = DateTime.UtcNow 
                });
            }
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

    // Get targets for a wallet group
    [HttpGet("group/{walletGroupId}")]
    public async Task<ActionResult<object>> GetByGroup(Guid walletGroupId)
    {
        var walletGroup = await _walletGroupService.GetAsync(walletGroupId);
        if (walletGroup == null)
        {
            return NotFound(new { error = $"Wallet group {walletGroupId} not found" });
        }

        // Try to get rebalance data saved with walletGroupId key
        var items = await _rebalanceService.GetByWalletGroupAsync(walletGroupId);
        
        if (items != null)
        {
            // Found data saved with walletGroupId
            return Ok(new 
            { 
                walletGroupId,
                accounts = walletGroup.Wallets,
                items,
                count = items.Count,
                key = walletGroupId.ToString()
            });
        }

        // Fallback: get data from individual accounts (legacy behavior)
        var accounts = walletGroup.Wallets;
        if (accounts.Count == 0)
        {
            return Ok(new 
            { 
                walletGroupId,
                accounts = Array.Empty<string>(),
                items = Array.Empty<RebalanceItem>(),
                count = 0
            });
        }

        var allItems = new Dictionary<string, List<RebalanceItem>?>();
        foreach (var account in accounts)
        {
            allItems[account] = await _rebalanceService.GetAsync(account);
        }

        return Ok(new 
        { 
            walletGroupId,
            accounts,
            data = allItems,
            totalAccounts = accounts.Count
        });
    }

    private string _getKey(string accountId)
    {
        // Compose the same key as service/cache
        return HttpContext.RequestServices.GetRequiredService<ICacheService>().GenerateRebalanceCacheKey(accountId);
    }
}
