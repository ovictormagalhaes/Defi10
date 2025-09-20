import React from 'react'
import AdvancedAnalytics from './AdvancedAnalytics'

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
  showLendingDefiTokens
}) => {
  // Usar a mesma lógica de cálculo do App.jsx
  const signedTokenValue = (t, pos) => {
    const ty = (t.type || '').toLowerCase()
    const val = Math.abs(parseFloat(t.totalPrice) || 0)
    if (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') return -val
    if (!ty) {
      const lbl = (pos?.position?.label || pos?.label || '').toLowerCase()
      if (lbl.includes('borrow') || lbl.includes('debt')) return -val
    }
    return val
  }

  // Cálculos básicos para o resumo
  const walletValue = walletTokens.reduce((sum, tokenData) => {
    const token = tokenData.token || tokenData
    return sum + (parseFloat(token.totalPrice) || 0)
  }, 0)

  const liquidityData = getLiquidityPoolsData()
  const lendingData = getLendingAndBorrowingData()
  const stakingData = getStakingData()
  
  const liquidityValue = groupDefiByProtocol(liquidityData).reduce((total, group) =>
    total + group.positions.reduce((sum, pos) =>
      sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (parseFloat(token.totalPrice) || 0), 0) || 0), 0
    ), 0)

  const lendingValue = groupDefiByProtocol(lendingData).reduce((grand, group) => {
    const groupSum = group.positions.reduce((sum, pos) => {
      const tokens = Array.isArray(pos.tokens) ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens) : []
      const net = tokens.reduce((s, t) => s + signedTokenValue(t, pos), 0)
      return sum + net
    }, 0)
    return grand + groupSum
  }, 0)

  const stakingValueCalc = stakingData.reduce((total, position) => {
    const balance = parseFloat(position.balance) || 0
    return total + (isNaN(balance) ? 0 : balance)
  }, 0)

  const totalValue = getTotalPortfolioValue()

  return (
    <div style={{
      background: theme.bgPanel,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: 24,
      marginTop: 16
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: theme.primarySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2">
            <path d="M9 11H1l6-6 6 6"/>
            <path d="M9 17l3-3 3 3"/>
            <path d="M22 18.5c0 2.485 0 4.5-4 4.5s-4-2.015-4-4.5S14 14 18 14s4 2.015 4 4.5"/>
            <circle cx="18" cy="5" r="3"/>
          </svg>
        </div>
        <div>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: theme.textPrimary,
            margin: 0,
            marginBottom: 4
          }}>Portfolio Summary</h2>
          <p style={{
            fontSize: 14,
            color: theme.textSecondary,
            margin: 0
          }}>Overview of your DeFi portfolio</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 20
      }}>
        {/* Total Portfolio Value */}
        <div style={{
          background: theme.bgInteractive,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: 16
        }}>
          <div style={{
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: 8,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Total Portfolio</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: theme.textPrimary
          }}>{maskValue(formatPrice(totalValue))}</div>
        </div>

        {/* Wallet Tokens */}
        <div style={{
          background: theme.bgInteractive,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: 16
        }}>
          <div style={{
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: 8,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Wallet Assets</div>
          <div style={{
            fontSize: 20,
            fontWeight: 600,
            color: theme.textPrimary,
            marginBottom: 4
          }}>{maskValue(formatPrice(walletValue))}</div>
          <div style={{
            fontSize: 12,
            color: theme.textSecondary
          }}>{walletTokens.length} tokens</div>
        </div>

        {/* DeFi Positions */}
        <div style={{
          background: theme.bgInteractive,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          padding: 16
        }}>
          <div style={{
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: 8,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>DeFi Positions</div>
          <div style={{
            fontSize: 20,
            fontWeight: 600,
            color: theme.textPrimary,
            marginBottom: 4
          }}>{maskValue(formatPrice(totalValue - walletValue))}</div>
          <div style={{
            fontSize: 12,
            color: theme.textSecondary
          }}>
            {liquidityData.length + lendingData.length + stakingData.length} positions
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap'
      }}>
        {liquidityData.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>
              {liquidityData.length} Liquidity Pool{liquidityData.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {lendingData.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#3b82f6'
            }}></div>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>
              {lendingData.length} Lending Position{lendingData.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {stakingData.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f59e0b'
            }}></div>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>
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
  )
}

export default SummaryView