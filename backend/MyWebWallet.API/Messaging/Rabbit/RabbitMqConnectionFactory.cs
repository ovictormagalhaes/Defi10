using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Security.Authentication;

namespace MyWebWallet.API.Messaging.Rabbit;

public interface IRabbitMqConnectionFactory
{
    IConnection GetConnection();
}

public class RabbitMqConnectionFactory : IRabbitMqConnectionFactory, IDisposable
{
    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqConnectionFactory> _logger;
    private IConnection? _connection;
    private readonly object _lock = new();

    public RabbitMqConnectionFactory(IOptions<RabbitMqOptions> options, ILogger<RabbitMqConnectionFactory> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public IConnection GetConnection()
    {
        if (_connection is { IsOpen: true }) return _connection;
        lock (_lock)
        {
            if (_connection is { IsOpen: true }) return _connection;
            var factory = new ConnectionFactory
            {
                HostName = _options.Host,
                VirtualHost = _options.VirtualHost,
                UserName = _options.Username,
                Password = _options.Password,
                Port = _options.Port,
                DispatchConsumersAsync = true,
                RequestedHeartbeat = TimeSpan.FromSeconds(_options.RequestedHeartbeatSeconds)
            };
            if (_options.UseTls)
            {
                factory.Ssl.Enabled = true;
                factory.Ssl.Version = SslProtocols.Tls12 | SslProtocols.Tls13;
            }
            _connection = factory.CreateConnection();
            _logger.LogInformation("RabbitMQ connection established to {Host} vhost {VHost}", _options.Host, _options.VirtualHost);
        }
        return _connection!;
    }

    public void Dispose()
    {
        try { _connection?.Dispose(); } catch { /* ignore */ }
    }
}
