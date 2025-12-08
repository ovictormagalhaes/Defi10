using DeFi10.API.Messaging.Contracts.Enums;
using DeFi10.API.Models;

namespace DeFi10.API.Messaging.Workers.TriggerRules;

public interface IProtocolTriggerDetector
{
    List<(IntegrationProvider Provider, Chain Chain)> DetectTriggersFromPayload(object? payload, Chain chain);
    IntegrationProvider HandlesProvider { get; }
}
