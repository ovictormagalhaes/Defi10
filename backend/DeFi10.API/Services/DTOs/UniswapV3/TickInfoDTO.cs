using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Numerics;

namespace DeFi10.API.Services.DTOs.UniswapV3
{
    [FunctionOutput]
    public class TickInfoDTO : IFunctionOutputDTO
    {
        [Parameter("uint128", "liquidityGross", 1)] 
        public BigInteger LiquidityGross { get; set; }
        [Parameter("int128", "liquidityNet", 2)] 
        public BigInteger LiquidityNet { get; set; }
        [Parameter("uint256", "feeGrowthOutside0X128", 3)] 
        public BigInteger FeeGrowthOutside0X128 { get; set; }
        [Parameter("uint256", "feeGrowthOutside1X128", 4)] 
        public BigInteger FeeGrowthOutside1X128 { get; set; }
    }
}
