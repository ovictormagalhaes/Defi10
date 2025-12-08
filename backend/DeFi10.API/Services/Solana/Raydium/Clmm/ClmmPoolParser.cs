using DeFi10.API.Services.Solana.Raydium.Clmm.DTO;
using System;

namespace DeFi10.API.Services.Solana.Raydium.Clmm;

public static class ClmmPoolParser
{
    public static ClmmPoolDTO Parse(byte[] data)
        => OffsetUtils.Parse<ClmmPoolDTO>(data);
}
