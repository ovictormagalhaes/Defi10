import React from 'react'
import colors from '../styles/colors'

/**
 * PoolTokenCell
 * A reusable row cell for Liquidity Pool tokens with aligned columns.
 * Layout: | Token (icon + symbol) | Rewards | Balance |
 */
export default function PoolTokenCell({ token, rewardText, balanceText, isLast = false }) {
  const baseContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 0.7fr 0.7fr', // proportional columns
    gap: '24px',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: colors.bgPanel,
    borderRadius: '8px',
    marginBottom: isLast ? '0' : '6px',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadowLight,
    transition: 'all 0.2s ease'
  }

  const leftCellStyle = {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0
  }

  const rightCellStyle = {
    textAlign: 'right'
  }

  const labelStyle = {
    fontSize: '11px',
    color: colors.textSecondary,
    marginBottom: '2px'
  }

  const valueStyle = {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: 600,
    color: colors.textPrimary
  }

  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      style={{
        ...baseContainerStyle,
  backgroundColor: hovered ? colors.bgPanelAlt : colors.bgPanel,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
  boxShadow: hovered ? colors.shadowHover : colors.shadowLight
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left: Token icon + symbol */}
      <div style={leftCellStyle}>
        {token?.logo && (
          <img
            src={token.logo}
            alt={token.symbol}
            style={{
              width: 20,
              height: 20,
              marginRight: 10,
              borderRadius: '50%',
              border: '1px solid #e0e0e0'
            }}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        )}
    <span style={{ fontWeight: 600, fontSize: '14px', color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {token?.symbol}
        </span>
      </div>

      {/* Middle: Rewards */}
      <div style={rightCellStyle}>
        <div style={labelStyle}>Rewards</div>
        <span style={{ ...valueStyle, fontSize: '13px', fontWeight: 500 }}>{rewardText}</span>
      </div>

      {/* Right: Balance */}
      <div style={rightCellStyle}>
        <div style={labelStyle}>Balance</div>
        <span style={valueStyle}>{balanceText}</span>
      </div>
    </div>
  )
}
