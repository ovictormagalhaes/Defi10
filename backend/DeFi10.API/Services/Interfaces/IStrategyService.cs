using DeFi10.API.Controllers.Requests;

namespace DeFi10.API.Services.Interfaces;

public interface IStrategyService
{
    Task SaveAsync(Guid walletGroupId, List<StrategyItem> items);
    Task<List<StrategyItem>?> GetAsync(Guid walletGroupId);
}
