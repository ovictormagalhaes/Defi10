using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace DeFi10.API.Messaging.Rabbit;

public abstract class BaseConsumer : BackgroundService
{
    private readonly IRabbitMqConnectionFactory _connectionFactory;
    private readonly ILogger _logger;
    private IModel? _channel;
    protected readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    protected RabbitMqOptions Options { get; }

    protected abstract string QueueName { get; }
    protected abstract void DeclareQueues(IModel channel);
    protected abstract Task HandleMessageAsync(string routingKey, ReadOnlyMemory<byte> body, IBasicProperties props, CancellationToken ct);

    protected BaseConsumer(IRabbitMqConnectionFactory connectionFactory, IOptions<RabbitMqOptions> options, ILogger logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
        Options = options.Value;
    }

    private IModel EnsureChannel()
    {
        if (_channel is { IsOpen: true }) return _channel;
        var connection = _connectionFactory.GetConnection();
        _channel = connection.CreateModel();
        _channel.BasicQos(0, 8, false);
        _channel.ExchangeDeclare(Options.Exchange, ExchangeType.Topic, durable: true, autoDelete: false);
        DeclareQueues(_channel);
        return _channel;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var channel = EnsureChannel();
        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.Received += async (ch, ea) =>
        {
            try
            {
                await HandleMessageAsync(ea.RoutingKey, ea.Body, ea.BasicProperties, stoppingToken);
                channel.BasicAck(ea.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling message {DeliveryTag} on {Queue}", ea.DeliveryTag, QueueName);
                channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: false);
            }
        };
        channel.BasicConsume(QueueName, autoAck: false, consumer: consumer);
        _logger.LogInformation("Started consumer for queue {Queue}", QueueName);
        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        base.Dispose();
        try { _channel?.Dispose(); } catch {  }
    }
}