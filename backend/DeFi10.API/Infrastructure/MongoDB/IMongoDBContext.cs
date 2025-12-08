using MongoDB.Driver;

namespace DeFi10.API.Infrastructure.MongoDB;

public interface IMongoDBContext
{
    IMongoDatabase Database { get; }
    IMongoCollection<T> GetCollection<T>(string collectionName);
}
