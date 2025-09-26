import React, { useMemo, useState } from 'react';

import { useMaskValues } from '../context/MaskValuesContext';
import { useTheme } from '../context/ThemeProvider';
import { formatPrice, formatTokenAmount } from '../utils/walletUtils';

import RangeChip from './RangeChip';
import TokenDisplay from './TokenDisplay';
import StandardHeader from './table/StandardHeader';

// Renders a liquidity pools table with expandable pool rows showing underlying tokens
export default function PoolTables({ pools = {} }) {
  const [openPools, setOpenPools] = useState({});
  const { theme } = useTheme(); // theme currently only used indirectly via CSS vars; keep for future extension
  const { maskValue } = useMaskValues();
  // Responsive breakpoints for columns
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const [vw, setVw] = useState(initialWidth);
  React.useEffect(() => {
    const onResize = () => setVw(typeof window !== 'undefined' ? window.innerWidth : initialWidth);
    if (typeof window !== 'undefined') window.addEventListener('resize', onResize);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('resize', onResize);
    };
  }, []);
  // Hide order as width shrinks: Range -> Rewards -> Amount
  const hideRange = vw < 950;
  const hideRewards = vw < 800;
  const hideAmount = vw < 600;

  const togglePool = (key) => setOpenPools((p) => ({ ...p, [key]: !p[key] }));

  const poolEntries = Object.entries(pools);
  if (poolEntries.length === 0) return null;

  // RangeChip moved to reusable component ./RangeChip

  // Build dynamic column ratios: Pool is 2, each visible metric is 1
  // Universal schema uses fixed columns now.

  const allKeys = poolEntries.map(([k]) => k);
  const allOpen = allKeys.every((k) => openPools[k]);
  const anyOpen = allKeys.some((k) => openPools[k]);

  const expandAll = () => setOpenPools(allKeys.reduce((acc, k) => ({ ...acc, [k]: true }), {}));
  const collapseAll = () => setOpenPools({});

  return (
    <div className="table-wrapper">
      {poolEntries.length > 3 && (
        <div className="expand-controls">
          <button
            type="button"
            className="btn btn-sm"
            disabled={allOpen}
            onClick={expandAll}
            title="Expand all pools"
          >
            Expand All
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={!anyOpen}
            onClick={collapseAll}
            title="Collapse all pools"
          >
            Collapse All
          </button>
        </div>
      )}
      <table className="table-unified text-primary">
        <StandardHeader
          columnDefs={[
            { key: 'range', label: 'Range', align: 'center' },
            { key: 'amount', label: 'Amount', align: 'right' },
            { key: 'rewards', label: 'Rewards', align: 'right' },
            { key: 'value', label: 'Value', align: 'right' },
          ]}
        />
        <tbody>
          {poolEntries.map(([key, pool], idx) => {
            const isOpen = !!openPools[key];
            const totalRewardsValue =
              pool.rewards?.reduce((s, r) => s + (parseFloat(r.totalPrice) || 0), 0) || 0;
            // Try to resolve a Uniswap V3-like range from pool-level or metadata
            const poolRange =
              pool.range || pool.position?.range || pool.meta?.range || pool.extra?.range;
            return (
              <React.Fragment key={key}>
                <tr
                  onClick={() => togglePool(key)}
                  className="table-row table-row-hover tbody-divider cursor-pointer"
                >
                  <td className="td text-primary col-name">
                    <span className="flex align-center gap-8">
                      <span
                        className="collapse-toggle"
                        aria-label={isOpen ? 'Collapse pool' : 'Expand pool'}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                      {Array.isArray(pool.tokens) && pool.tokens.length > 0 && (
                        <TokenDisplay
                          tokens={pool.tokens.slice(0, 2)}
                          size={24}
                          showChain={false}
                        />
                      )}
                    </span>
                  </td>
                  <td className="td td-center col-range">
                    {poolRange ? <RangeChip range={poolRange} /> : <span className="td-placeholder">-</span>}
                  </td>
                  <td className="td td-right td-mono text-primary col-amount">-</td>
                  <td className="td td-right td-mono text-primary col-rewards">
                    {maskValue(formatPrice(totalRewardsValue))}
                  </td>
                  <td className="td td-right td-mono td-mono-strong text-primary col-value">
                    {maskValue(formatPrice(pool.totalValue))}
                  </td>
                </tr>
                {isOpen && pool.tokens && (
                  <React.Fragment>
                    {pool.tokens.map((t, tIdx) => {
                    const rewardForToken = (pool.rewards || []).filter(
                      (r) => (r.symbol || '').toLowerCase() === (t.symbol || '').toLowerCase()
                    );
                    const rewardValue = rewardForToken.reduce(
                      (s, r) => s + (parseFloat(r.totalPrice) || 0),
                      0
                    );
                    const amountDisplay = formatTokenAmount(t);
                    return (
                      <tr key={tIdx} className="table-row tbody-divider pool-token-rows-enter">
                        <td className="td-small text-secondary col-name" style={{ paddingLeft: 34 }}>
                          <span className="flex align-center">
                            <TokenDisplay tokens={[t]} size={18} showChain={false} />
                          </span>
                        </td>
                        <td className="td-small td-center col-range" />
                        <td className="td-small td-right td-mono text-primary col-amount">
                          {maskValue(amountDisplay, { short: true })}
                        </td>
                        <td className="td-small td-right td-mono text-primary col-rewards">
                          {rewardValue ? maskValue(formatPrice(rewardValue)) : '-'}
                        </td>
                        <td className="td-small td-right td-mono td-mono-strong text-primary col-value">
                          {maskValue(formatPrice(parseFloat(t.totalPrice) || 0))}
                        </td>
                      </tr>
                    );
                    })}
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
