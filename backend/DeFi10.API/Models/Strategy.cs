using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using DeFi10.API.Controllers.Requests;

namespace DeFi10.API.Models;

public sealed class Strategy
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonElement("walletGroupId")]
    [BsonRepresentation(BsonType.String)]
    [Required]
    public Guid WalletGroupId { get; set; }

    [BsonElement("version")]
    public int Version { get; set; } = 1;

    [BsonElement("items")]
    [Required]
    public List<StrategyItem> Items { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("isDeleted")]
    public bool IsDeleted { get; set; } = false;
}
