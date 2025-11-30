using RabbitMQ.Client;

namespace MyWebWallet.API.Messaging.Rabbit;

public interface IRabbitMqConnectionFactory
{
    IConnection GetConnection();
}
