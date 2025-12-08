using DeFi10.API.Services.Solana.Raydium.Clmm.DTO;
using System;

namespace DeFi10.API.Services.Solana.Raydium.Clmm;

public static class ClmmPositionParser
{
    public static ClmmPositionDTO Parse(byte[] data)
        => OffsetUtils.Parse<ClmmPositionDTO>(data);
}
