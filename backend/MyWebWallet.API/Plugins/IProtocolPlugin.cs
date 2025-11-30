using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;
using ChainEnum = MyWebWallet.API.Models.Chain;

namespace MyWebWallet.API.Plugins
{


    public interface IProtocolPlugin : IChainSupportService
    {


        string ProtocolId { get; }


        string Version { get; }


        string Description { get; }


        string WebsiteUrl { get; }


        string LogoUrl { get; }


        Task InitializeAsync(IServiceProvider serviceProvider, CancellationToken cancellationToken = default);


        Task<ValidationResult> ValidateConfigurationAsync(ChainEnum chain, CancellationToken cancellationToken = default);


        Task<List<WalletItem>> GetWalletItemsAsync(string accountAddress, ChainEnum chain, CancellationToken cancellationToken = default);


        Task<HealthCheckResult> CheckHealthAsync(ChainEnum? chain = null, CancellationToken cancellationToken = default);
    }


    public interface IDeFiProtocolPlugin : IProtocolPlugin
    {


        IEnumerable<WalletItemType> SupportedPositionTypes { get; }


        Task<WalletItem?> GetPositionAsync(string positionId, ChainEnum chain, CancellationToken cancellationToken = default);


        Task<object?> GetHistoricalDataAsync(string accountAddress, ChainEnum chain, DateTime? fromDate = null, CancellationToken cancellationToken = default);
    }


    public class HealthCheckResult
    {
        public bool IsHealthy { get; set; }
        public string Status { get; set; } = "Unknown";
        public TimeSpan ResponseTime { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;

        public static HealthCheckResult Healthy(TimeSpan responseTime, string status = "Healthy")
            => new() { IsHealthy = true, Status = status, ResponseTime = responseTime };

        public static HealthCheckResult Unhealthy(string status, IEnumerable<string>? errors = null)
            => new() { IsHealthy = false, Status = status, Errors = errors?.ToList() ?? new() };
    }


    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public Dictionary<string, object> AdditionalData { get; set; } = new();

        public static ValidationResult Valid() => new() { IsValid = true };
        public static ValidationResult Invalid(IEnumerable<string> errors) => new() { IsValid = false, Errors = errors.ToList() };
    }


    [AttributeUsage(AttributeTargets.Class)]
    public class ProtocolPluginAttribute : Attribute
    {
        public string ProtocolId { get; }
        public string Name { get; }
        public string Version { get; }

        public ProtocolPluginAttribute(string protocolId, string name, string version)
        {
            ProtocolId = protocolId;
            Name = name;
            Version = version;
        }
    }
}