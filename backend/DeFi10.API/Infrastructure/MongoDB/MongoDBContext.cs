using Microsoft.Extensions.Options;
using MongoDB.Driver;
using DeFi10.API.Configuration;

namespace DeFi10.API.Infrastructure.MongoDB;

public sealed class MongoDBContext : IMongoDBContext
{
    private readonly IMongoDatabase _database;
    private readonly ILogger<MongoDBContext> _logger;

    public MongoDBContext(IOptions<MongoDBOptions> options, ILogger<MongoDBContext> logger)
    {
        _logger = logger;
        var mongoOptions = options.Value;

        try
        {
            var client = new MongoClient(mongoOptions.ConnectionString);
            _database = client.GetDatabase(mongoOptions.DatabaseName);
            
            _logger.LogInformation(
                "MongoDB connection established: Database={DatabaseName}", 
                mongoOptions.DatabaseName
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to MongoDB");
            throw;
        }
    }

    public IMongoDatabase Database => _database;

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}
