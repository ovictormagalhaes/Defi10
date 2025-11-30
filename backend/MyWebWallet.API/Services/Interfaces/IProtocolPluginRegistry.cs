using MyWebWallet.API.Models;
using MyWebWallet.API.Plugins;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Services;

public interface IProtocolPluginRegistry
{
    Task<int> DiscoverAndRegisterPluginsAsync();
    void RegisterPlugin<T>() where T : class, IProtocolPlugin;
    IEnumerable<IProtocolPlugin> GetAllPlugins();
    IProtocolPlugin? GetPlugin(string protocolId);
    IEnumerable<IProtocolPlugin> GetPluginsForChain(ChainEnum chain);
    IEnumerable<IDeFiProtocolPlugin> GetPluginsForType(WalletItemType walletItemType);
    Task<Dictionary<string, HealthCheckResult>> CheckPluginHealthAsync(string? protocolId = null);
}
