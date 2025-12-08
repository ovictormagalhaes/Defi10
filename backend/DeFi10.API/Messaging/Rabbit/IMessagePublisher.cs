namespace DeFi10.API.Messaging.Rabbit;

public interface IMessagePublisher
{
    Task PublishAsync(string routingKey, object message, CancellationToken ct = default);
}
