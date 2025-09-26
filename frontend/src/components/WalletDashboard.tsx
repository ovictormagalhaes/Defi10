import React, { useState, useEffect, useCallback } from 'react';

import { useMaskValues } from '../context/MaskValuesContext';
import { getHealth, getSupportedChains, getWallet } from '../services/apiClient';
import { HealthStatus, SupportedChain, WalletData, WalletItem } from '../types/api';
import { parseNumeric, formatNumber } from '../utils/format';

import Panel from './Panel';
import StatusBadge from './StatusBadge';

const WalletDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [chains, setChains] = useState<SupportedChain[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState<string[]>(['Base']);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { maskValues } = useMaskValues();

  // Log valor total e informações de cada chain sempre que selectedChains ou walletData mudam
  useEffect(() => {
    if (!walletData || !walletData.items) return;
    const chainTotals: Record<string, number> = {};
    walletData.items.forEach((item: WalletItem) => {
      const chain = (item.network || (item as any).chain || 'Unknown') as string;
      const rawVal = item.totalPrice ?? item.value ?? 0;
      const value = parseNumeric(rawVal, 0);
      if (!chainTotals[chain]) chainTotals[chain] = 0;
      chainTotals[chain] += value;
    });
    const total = Object.values(chainTotals).reduce((a, b) => a + b, 0);
    console.log('[WalletDashboard] Chains selecionadas:', selectedChains);
    console.log('[WalletDashboard] Totais por chain:', chainTotals);
    console.log('[WalletDashboard] Valor total:', total);
    console.log('[WalletDashboard] Dados detalhados:', walletData.items);
  }, [selectedChains, walletData]);

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
    loadSupportedChains();
  }, []);

  const checkApiHealth = useCallback(async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to check API health:', err);
      setError('Failed to connect to API');
    }
  }, []);

  const loadSupportedChains = useCallback(async () => {
    try {
      const data = await getSupportedChains();
      setChains(data);
    } catch (err) {
      console.error('Failed to load supported chains:', err);
    }
  }, []);

  interface ApiErrorLike {
    response?: { data?: { error?: string; title?: string } };
    message?: string;
  }

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      const e = err as ApiErrorLike;
      return (
        e.response?.data?.error ||
        e.response?.data?.title ||
        e.message ||
        'Failed to load wallet data'
      );
    }
    return 'Failed to load wallet data';
  };

  const loadWalletData = useCallback(async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getWallet(walletAddress, selectedChains);
      setWalletData(data);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [walletAddress, selectedChains]);

  const handleChainToggle = useCallback((chainName: string) => {
    setSelectedChains((prev) =>
      prev.includes(chainName) ? prev.filter((c) => c !== chainName) : [...prev, chainName]
    );
  }, []);

  // Helper to mask address
  // Always return a fixed number of dots for mask mode
  const maskAddress = (_addr: string) => '••••••••••••••••••••••••••••••••••••••••';

  return (
    <div className="page-container">
      <h1>Defi10 - DeFi Portfolio Dashboard</h1>
      <p className="muted mb-30">
        Multi-chain DeFi portfolio tracking with real-time data from Base and BNB chains
      </p>

      {/* API Health Status */}
      <Panel variant="neutral-light" className="mb-5">
        <h3>API Status</h3>
        {health ? (
          <div>
            <p>
              <strong>Status:</strong>{' '}
              <StatusBadge status={health.status === 'healthy' ? 'healthy' : 'unhealthy'} />
            </p>
            <p>
              <strong>Environment:</strong> {health.environment}
            </p>
            <p>
              <strong>Version:</strong> {health.version}
            </p>
            <p>
              <strong>Last Check:</strong> {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        ) : (
          <div>
            {!error && <StatusBadge status="loading" />}
            {error && <StatusBadge status="unhealthy" label="API not responding" />}
          </div>
        )}
      </Panel>

      {/* Chain Selection */}
      <Panel variant="neutral-lighter" className="mb-5">
        <h3>Supported Blockchains</h3>
        <div className="chain-pill-bar" role="listbox" aria-label="Select blockchains">
          {chains.map((chain) => {
            const displayName = chain.displayName || chain.name || chain.id;
            const chainKey = chain.name || chain.displayName || chain.id;
            const active = chainKey ? selectedChains.includes(chainKey) : false;
            return (
              <button
                type="button"
                key={chain.id}
                role="option"
                aria-selected={active}
                className={`chain-pill ${active ? 'is-active' : ''}`}
                onClick={() => chainKey && handleChainToggle(chainKey)}
                title={active ? 'Click to remove chain' : 'Click to add chain'}
              >
                {chain.iconUrl && (
                  <img
                    src={chain.iconUrl}
                    alt=""
                    aria-hidden="true"
                    className="icon-14"
                    style={{ width: 14, height: 14, borderRadius: '50%' }}
                  />
                )}
                {displayName}
              </button>
            );
          })}
        </div>
        <p className="small muted mt-1">
          Tip: Click a pill to {`add/remove`} a chain. Active chains are highlighted.
        </p>
      </Panel>

      {/* Wallet Input */}
      <Panel className="mb-5 panel--surface-alt">
        <h3>?? Load DeFi Portfolio</h3>
        <div className="flex gap-10 align-center">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="input"
            aria-label="Wallet address"
          />
          <button
            type="button"
            className="btn-copy"
            onClick={() => {
              if (!walletAddress) return;
              navigator.clipboard
                .writeText(walletAddress)
                .then(() => {
                  const el = document.querySelector('.btn-copy');
                  if (el) {
                    el.classList.add('is-success');
                    setTimeout(() => el.classList.remove('is-success'), 1400);
                  }
                })
                .catch(() => {});
            }}
            disabled={!walletAddress}
            aria-disabled={!walletAddress}
            title={walletAddress ? 'Copy address to clipboard' : 'Enter an address first'}
          >
            Copy
          </button>
          <button
            onClick={loadWalletData}
            disabled={loading || !walletAddress}
            className={`btn ${loading ? 'btn--loading' : ''}`}
          >
            {loading ? 'Loading...' : '?? Load Portfolio'}
          </button>
        </div>
        <p className="small muted mt-1">
          Selected chains: {selectedChains.join(', ')} | Protocols: Aave, Uniswap V3, Moralis
        </p>
      </Panel>

      {/* Error Display */}
      {error && (
        <Panel variant="error" className="mb-5">
          <strong>Error:</strong> {error}
        </Panel>
      )}

      {/* Wallet Data Display */}
      {walletData && (
        <Panel variant="success">
          <h3>?? Portfolio Summary</h3>
          <p>
            <strong>Account:</strong>{' '}
            {maskValues ? (
              <span className="mono mono-truncate">{maskAddress(walletData.account)}</span>
            ) : (
              <span className="mono mono-truncate">{walletData.account}</span>
            )}
          </p>
          <p>
            <strong>Network:</strong> {walletData.network}
          </p>
          <p>
            <strong>Positions:</strong> {walletData.items.length}
          </p>
          <p>
            <strong>Aggregated Value (est.):</strong>{' '}
            {formatNumber(
              walletData.items.reduce((sum, it) => {
                const v = parseNumeric(it.totalPrice ?? it.value ?? 0, 0);
                return sum + v;
              }, 0),
              { decimals: 2, minCompact: 1_000 }
            )}
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date(walletData.lastUpdated).toLocaleString()}
          </p>

          {walletData.items.length > 0 && (
            <details className="mt-10">
              <summary className="summary-toggle">
                ?? View Detailed Data ({walletData.items.length} positions)
              </summary>
              <pre className="code-block">{JSON.stringify(walletData, null, 2)}</pre>
            </details>
          )}
        </Panel>
      )}

      {/* Footer */}
      <div className="mt-40 footer">
        <p>Defi10 - Multi-chain DeFi Portfolio Tracker | Powered by Moralis, Aave, Uniswap V3</p>
      </div>
    </div>
  );
};

export default WalletDashboard;
