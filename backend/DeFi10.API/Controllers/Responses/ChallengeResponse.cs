namespace DeFi10.API.Controllers.Responses;

public sealed class ChallengeResponse
{
    public required string Challenge { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int Difficulty { get; set; }
}
