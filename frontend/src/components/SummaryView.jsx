import React from 'react';

import AdvancedAnalytics from './AdvancedAnalytics';

const SummaryView = ({
  walletTokens,
  getLiquidityPoolsData,
  getLendingAndBorrowingData,
  getStakingData,
  getTotalPortfolioValue,
  maskValue,
  formatPrice,
  theme,
  groupDefiByProtocol,
  filterLendingDefiTokens,
  showLendingDefiTokens,
}) => {
  // Usar a mesma lógica de cálculo do App.jsx
  const signedTokenValue = (t, pos) => {
    const ty = (t.type || '').toLowerCase();
    const val = Math.abs(parseFloat(t.totalPrice) || 0);
    if (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') return -val;
    if (!ty) {
      const lbl = (pos?.position?.label || pos?.label || '').toLowerCase();
      if (lbl.includes('borrow') || lbl.includes('debt')) return -val;
    }
    return val;
  };

  // Cálculos básicos para o resumo
  const walletValue = walletTokens.reduce((sum, tokenData) => {
    const token = tokenData.token || tokenData;
    return sum + (parseFloat(token.totalPrice) || 0);
  }, 0);

  const liquidityData = getLiquidityPoolsData();
  const lendingData = getLendingAndBorrowingData();
  const stakingData = getStakingData();

  const liquidityValue = groupDefiByProtocol(liquidityData).reduce(
    (total, group) =>
      total +
      group.positions.reduce(
        (sum, pos) =>
          sum +
          (pos.tokens?.reduce(
            (tokenSum, token) => tokenSum + (parseFloat(token.totalPrice) || 0),
            0
          ) || 0),
        0
      ),
    0
  );

  const lendingValue = groupDefiByProtocol(lendingData).reduce((grand, group) => {
    const groupSum = group.positions.reduce((sum, pos) => {
      const tokens = Array.isArray(pos.tokens)
        ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens)
        : [];
      const net = tokens.reduce((s, t) => s + signedTokenValue(t, pos), 0);
      return sum + net;
    }, 0);
    return grand + groupSum;
  }, 0);

  const stakingValueCalc = stakingData.reduce((total, position) => {
    const balance = parseFloat(position.balance) || 0;
    return total + (isNaN(balance) ? 0 : balance);
  }, 0);

  const totalValue = getTotalPortfolioValue();

  return (
    <div className="summary-panel p-6 mt-4">
      <div className="summary-header">
        <div className="circle-32 bg-primary-subtle">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.textPrimary}
            strokeWidth="2"
          >
            <path d="M9 11H1l6-6 6 6" />
            <path d="M9 17l3-3 3 3" />
            <path d="M22 18.5c0 2.485 0 4.5-4 4.5s-4-2.015-4-4.5S14 14 18 14s4 2.015 4 4.5" />
            <circle cx="18" cy="5" r="3" />
          </svg>
        </div>
        <div className="">
          <h2 className="summary-title text-primary">
            Portfolio Summary
          </h2>
          <p className="summary-sub text-secondary">
            Overview of your DeFi portfolio
          </p>
        </div>
      </div>

      <div className="summary-grid">
        {/* Total Portfolio Value */}
        <div className="metric-card">
          <div className="metric-label">
            Total Portfolio
          </div>
          <div className="metric-value-lg text-primary">
            {maskValue(formatPrice(totalValue))}
          </div>
        </div>

        {/* Wallet Tokens */}
        <div className="metric-card">
          <div className="metric-label">
            Wallet Assets
          </div>
          <div className="metric-value-md text-primary mb-1">
            {maskValue(formatPrice(walletValue))}
          </div>
          <div className="text-xs text-secondary">
            {walletTokens.length} tokens
          </div>
        </div>

        {/* DeFi Positions */}
        <div className="metric-card">
          <div className="metric-label">
            DeFi Positions
          </div>
          <div className="metric-value-md text-primary mb-1">
            {maskValue(formatPrice(totalValue - walletValue))}
          </div>
          <div className="text-xs text-secondary">
            {liquidityData.length + lendingData.length + stakingData.length} positions
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {liquidityData.length > 0 && (
          <div className="quick-stat">
            <div className="quick-dot liquidity" />
            <span className="fs-13 text-secondary">
              {liquidityData.length} Liquidity Pool{liquidityData.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {lendingData.length > 0 && (
          <div className="quick-stat">
            <div className="quick-dot lending" />
            <span className="fs-13 text-secondary">
              {lendingData.length} Lending Position{lendingData.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {stakingData.length > 0 && (
          <div className="quick-stat">
            <div className="quick-dot staking" />
            <span className="fs-13 text-secondary">
              {stakingData.length} Staking Position{stakingData.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Advanced Analytics */}
      <AdvancedAnalytics
        walletTokens={walletTokens}
        getLiquidityPoolsData={getLiquidityPoolsData}
        getLendingAndBorrowingData={getLendingAndBorrowingData}
        getStakingData={getStakingData}
        getTotalPortfolioValue={getTotalPortfolioValue}
        maskValue={maskValue}
        formatPrice={formatPrice}
        theme={theme}
        groupDefiByProtocol={groupDefiByProtocol}
        filterLendingDefiTokens={filterLendingDefiTokens}
        showLendingDefiTokens={showLendingDefiTokens}
      />
    </div>
  );
};

export default SummaryView;
