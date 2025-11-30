using MyWebWallet.API.Models;

namespace MyWebWallet.API.DTOs;

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
