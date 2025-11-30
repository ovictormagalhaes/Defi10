using Microsoft.Extensions.Options;
using MyWebWallet.API.Configuration;
using MyWebWallet.API.DTOs;
using MyWebWallet.API.Models;
using MyWebWallet.API.Services.Interfaces;

namespace MyWebWallet.API.Services;

public interface IProtocolStatusService
{
    ProtocolStatusListResponse GetProtocolStatus();
}

public class ProtocolStatusService : IProtocolStatusService
{
    private readonly MoralisOptions _moralisOptions;
    private readonly AaveOptions _aaveOptions;
    private readonly UniswapV3Options _uniswapV3Options;
    private readonly RaydiumOptions _raydiumOptions;
    private readonly PendleOptions _pendleOptions;
    private readonly KaminoOptions _kaminoOptions;
    private readonly IProtocolConfigurationService _protocolConfig;

    public ProtocolStatusService(
        IOptions<MoralisOptions> moralisOptions,
        IOptions<AaveOptions> aaveOptions,
        IOptions<UniswapV3Options> uniswapV3Options,
        IOptions<RaydiumOptions> raydiumOptions,
        IOptions<PendleOptions> pendleOptions,
        IOptions<KaminoOptions> kaminoOptions,
        IProtocolConfigurationService protocolConfig)
    {
        _moralisOptions = moralisOptions.Value;
        _aaveOptions = aaveOptions.Value;
        _uniswapV3Options = uniswapV3Options.Value;
        _raydiumOptions = raydiumOptions.Value;
        _pendleOptions = pendleOptions.Value;
        _kaminoOptions = kaminoOptions.Value;
        _protocolConfig = protocolConfig;
    }

    public ProtocolStatusListResponse GetProtocolStatus()
    {
        var protocols = new List<ProtocolStatusResponse>();

        // Moralis EVM
        var moralisEvm = BuildMoralisEvmStatus();
        if (moralisEvm != null) protocols.Add(moralisEvm);

        // Moralis Solana
        var moralisSolana = BuildMoralisSolanaStatus();
        if (moralisSolana != null) protocols.Add(moralisSolana);

        // Aave V3
        var aave = BuildAaveStatus();
        if (aave != null) protocols.Add(aave);

        // Uniswap V3
        var uniswap = BuildUniswapV3Status();
        if (uniswap != null) protocols.Add(uniswap);

        // Pendle V2
        var pendle = BuildPendleStatus();
        if (pendle != null) protocols.Add(pendle);

        // Raydium
        var raydium = BuildRaydiumStatus();
        if (raydium != null) protocols.Add(raydium);

        // Kamino
        var kamino = BuildKaminoStatus();
        if (kamino != null) protocols.Add(kamino);

        var availableChains = GetAvailableChains();

        return new ProtocolStatusListResponse(protocols, availableChains);
    }

    private ProtocolStatusResponse? BuildMoralisEvmStatus()
    {
        var config = _protocolConfig.GetProtocol("moralis");
        if (config == null) return null;

        var chainSupport = new Dictionary<string, bool>();
        
        var evmChains = new[] { Chain.Base, Chain.Arbitrum, Chain.Ethereum, Chain.BNB };
        foreach (var chain in evmChains)
        {
            var chainConfig = _protocolConfig.GetProtocolOnChain("moralis", chain);
            chainSupport[chain.ToString()] = _moralisOptions.Enabled && chainConfig?.Enabled == true;
        }

        return new ProtocolStatusResponse(
            ProtocolId: "moralis-evm",
            ProtocolName: "Moralis (EVM Wallet)",
            IconUrl: config.Icon,
            Website: config.Website,
            BlockchainGroup: BlockchainGroup.EVM,
            ChainSupport: chainSupport
        );
    }

    private ProtocolStatusResponse? BuildMoralisSolanaStatus()
    {
        var config = _protocolConfig.GetProtocol("moralis");
        if (config == null) return null;

        var chainConfig = _protocolConfig.GetProtocolOnChain("moralis", Chain.Solana);
        var chainSupport = new Dictionary<string, bool>
        {
            [Chain.Solana.ToString()] = _moralisOptions.Enabled && chainConfig?.Enabled == true
        };

        return new ProtocolStatusResponse(
            ProtocolId: "moralis-solana",
            ProtocolName: "Moralis (Solana Wallet)",
            IconUrl: config.Icon,
            Website: config.Website,
            BlockchainGroup: BlockchainGroup.Solana,
            ChainSupport: chainSupport
        );
    }

    private ProtocolStatusResponse? BuildAaveStatus()
    {
        var config = _protocolConfig.GetProtocol("aave-v3");
        if (config == null) return null;

        var chainSupport = new Dictionary<string, bool>();
        
        var supportedChains = new[] { Chain.Base, Chain.Arbitrum, Chain.Ethereum };
        foreach (var chain in supportedChains)
        {
            var chainConfig = _protocolConfig.GetProtocolOnChain("aave-v3", chain);
            chainSupport[chain.ToString()] = _aaveOptions.Enabled && chainConfig?.Enabled == true;
        }

        return new ProtocolStatusResponse(
            ProtocolId: "aave-v3",
            ProtocolName: config.DisplayName ?? "Aave V3",
            IconUrl: config.Icon,
            Website: config.Website,
            BlockchainGroup: BlockchainGroup.EVM,
            ChainSupport: chainSupport
        );
    }

    private ProtocolStatusResponse? BuildUniswapV3Status()
    {
        var config = _protocolConfig.GetProtocol("uniswap-v3");
        if (config == null) return null;

        var chainSupport = new Dictionary<string, bool>();
        
        var supportedChains = new[] { Chain.Base, Chain.Arbitrum };
        foreach (var chain in supportedChains)
        {
            var chainConfig = _protocolConfig.GetProtocolOnChain("uniswap-v3", chain);
            chainSupport[chain.ToString()] = _uniswapV3Options.Enabled && chainConfig?.Enabled == true;
        }

        return new ProtocolStatusResponse(
            ProtocolId: "uniswap-v3",
            ProtocolName: config.DisplayName ?? "Uniswap V3",
            IconUrl: config.Icon,
            Website: config.Website,
            BlockchainGroup: BlockchainGroup.EVM,
            ChainSupport: chainSupport
        );
    }

    private ProtocolStatusResponse? BuildPendleStatus()
    {
        var config = _protocolConfig.GetProtocol("pendle-v2");
        if (config == null) return null;

        var chainSupport = new Dictionary<string, bool>();
        
        var chainConfig = _protocolConfig.GetProtocolOnChain("pendle-v2", Chain.Ethereum);
        chainSupport[Chain.Ethereum.ToString()] = _pendleOptions.Enabled && chainConfig?.Enabled == true;

        return new ProtocolStatusResponse(
            ProtocolId: "pendle-v2",
            ProtocolName: config.DisplayName ?? "Pendle V2",
            IconUrl: config.Icon,
            Website: config.Website,
            BlockchainGroup: BlockchainGroup.EVM,
            ChainSupport: chainSupport
        );
    }

    private ProtocolStatusResponse? BuildRaydiumStatus()
    {
        return new ProtocolStatusResponse(
            ProtocolId: "raydium",
            ProtocolName: "Raydium",
            IconUrl: "https://raydium.io/logo.svg",
            Website: "https://raydium.io",
            BlockchainGroup: BlockchainGroup.Solana,
            ChainSupport: new Dictionary<string, bool>
            {
                [Chain.Solana.ToString()] = _raydiumOptions.Enabled
            }
        );
    }

    private ProtocolStatusResponse? BuildKaminoStatus()
    {
        return new ProtocolStatusResponse(
            ProtocolId: "kamino",
            ProtocolName: "Kamino Finance",
            IconUrl: "https://app.kamino.finance/favicon.ico",
            Website: "https://app.kamino.finance",
            BlockchainGroup: BlockchainGroup.Solana,
            ChainSupport: new Dictionary<string, bool>
            {
                [Chain.Solana.ToString()] = _kaminoOptions.Enabled
            }
        );
    }

    private List<string> GetAvailableChains()
    {
        return new List<string> { "Base", "Arbitrum", "Ethereum", "BNB", "Solana" };
    }
}
