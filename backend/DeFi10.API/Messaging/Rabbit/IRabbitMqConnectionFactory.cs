using RabbitMQ.Client;

namespace DeFi10.API.Messaging.Rabbit;

public interface IRabbitMqConnectionFactory
{
    IConnection GetConnection();
}
