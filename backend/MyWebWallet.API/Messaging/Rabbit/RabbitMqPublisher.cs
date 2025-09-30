using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MyWebWallet.API.Messaging.Rabbit;

public interface IMessagePublisher
{
    Task PublishAsync(string routingKey, object message, CancellationToken ct = default);
}

public class RabbitMqPublisher : IMessagePublisher, IDisposable
{
    private readonly IRabbitMqConnectionFactory _connectionFactory;
    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqPublisher> _logger;
    private IModel? _channel;
    private readonly SemaphoreSlim _initLock = new(1,1);
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public RabbitMqPublisher(IRabbitMqConnectionFactory connectionFactory, IOptions<RabbitMqOptions> options, ILogger<RabbitMqPublisher> logger)
    {
        _connectionFactory = connectionFactory;
        _options = options.Value;
        _logger = logger;
    }

    private IModel GetOrCreateChannel()
    {
        if (_channel is { IsOpen: true }) return _channel;
        var connection = _connectionFactory.GetConnection();
        _channel = connection.CreateModel();
        _channel.ExchangeDeclare(_options.Exchange, ExchangeType.Topic, durable: true, autoDelete: false);
        if (_options.PublisherConfirms) _channel.ConfirmSelect();
        return _channel;
    }

    public async Task PublishAsync(string routingKey, object message, CancellationToken ct = default)
    {
        await _initLock.WaitAsync(ct);
        try
        {
            var ch = GetOrCreateChannel();
            var body = JsonSerializer.SerializeToUtf8Bytes(message, _jsonOptions);
            var props = ch.CreateBasicProperties();
            props.ContentType = "application/json";
            props.DeliveryMode = 2; // persistent
            props.MessageId = Guid.NewGuid().ToString();
            props.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            ch.BasicPublish(exchange: _options.Exchange, routingKey: routingKey, mandatory: false, basicProperties: props, body: body);
            if (_options.PublisherConfirms)
            {
                ch.WaitForConfirmsOrDie(TimeSpan.FromSeconds(5));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish message to routingKey {RoutingKey}", routingKey);
            throw;
        }
        finally
        {
            _initLock.Release();
        }
    }

    public void Dispose()
    {
        try { _channel?.Dispose(); } catch { /* ignore */ }
    }
}
