using DeFi10.API.Models;

namespace DeFi10.API.DTOs;

public record ProtocolStatusResponse(
    string ProtocolId,
    string ProtocolName,
    string? IconUrl,
    string? Website,
    BlockchainGroup BlockchainGroup,
    Dictionary<string, bool> ChainSupport
);

public record ProtocolStatusListResponse(
    List<ProtocolStatusResponse> Protocols,
    List<string> AvailableChains
);

public enum BlockchainGroup
{
    EVM,
    Solana,
    All
}
