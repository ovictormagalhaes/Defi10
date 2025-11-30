using Microsoft.Extensions.DependencyInjection;

namespace MyWebWallet.API.Messaging.Extensions;


public class UniswapV3WorkerOptions
{
    public const string SectionName = "UniswapV3Workers";


    public TimeSpan GranularOperationTimeout { get; set; } = TimeSpan.FromSeconds(30);


    public int MaxRetryAttempts { get; set; } = 3;


    public TimeSpan JobCompletionTimeout { get; set; } = TimeSpan.FromMinutes(5);


    public double MinSuccessRate { get; set; } = 0.7;


    public bool EnableGranularProcessing { get; set; } = true;


    public int MaxParallelOperations { get; set; } = 10;
}