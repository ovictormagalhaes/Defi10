using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MyWebWallet.API.Services.Solana.Raydium.Clmm.DTO;
using MyWebWallet.API.Services.Models;
using MyWebWallet.API.Services.Models.Solana.Raydium;

namespace MyWebWallet.API.Services.Solana.Raydium.Clmm
{


    public class RaydiumHybridService
    {
        private readonly RaydiumApiService _apiService;
        private readonly RaydiumOnChainService _onChainService;
        private readonly ILogger<RaydiumHybridService> _logger;

        public RaydiumHybridService(
            RaydiumApiService apiService,
            RaydiumOnChainService onChainService,
            ILogger<RaydiumHybridService> logger)
        {
            _apiService = apiService;
            _onChainService = onChainService;
            _logger = logger;
        }


        public async Task<RaydiumPoolInfo?> GetPoolInfoFromApiAsync(string poolId)
        {
            return await _apiService.GetPoolInfoAsync(poolId);
        }


        public async Task<List<RaydiumPosition>> GetPositionsByOwnerAsync(string ownerAddress)
        {

            _logger.LogInformation("Fetching positions on-chain for owner {Owner}", ownerAddress);
            return await _onChainService.GetPositionsAsync(ownerAddress);
        }
    }
}
