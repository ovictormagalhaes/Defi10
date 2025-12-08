using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DeFi10.API.Models;


public sealed class WalletGroup
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    [BsonElement("wallets")]
    [Required]
    [MinLength(1, ErrorMessage = "At least one wallet address is required")]
    [MaxLength(3, ErrorMessage = "Maximum of 3 wallet addresses allowed")]
    public List<string> Wallets { get; set; } = new();

    [BsonElement("version")]
    public int Version { get; set; } = 1;

    [BsonElement("displayName")]
    [MaxLength(100)]
    public string? DisplayName { get; set; }

    [BsonElement("passwordHash")]
    public string? PasswordHash { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("isDeleted")]
    public bool IsDeleted { get; set; } = false;
}
