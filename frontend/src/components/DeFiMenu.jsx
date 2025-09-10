import React from 'react'
import CollapsibleMenu from './CollapsibleMenu'
import { formatPrice, groupDefiByProtocol, groupTokensByPool } from '../utils/walletUtils'

const DeFiMenu = ({ 
  title, 
  data, 
  isExpanded, 
  onToggle, 
  protocolExpansions, 
  toggleProtocolExpansion,
  getTotalPortfolioValue,
  calculatePercentage,
  menuType = 'default' // 'liquidity', 'lending', 'staking'
}) => {
  if (!data || data.length === 0) return null

  const getMenuColumns = () => {
    switch (menuType) {
      case 'liquidity':
        return {
          pools: {
            label: "Pools",
            value: groupDefiByProtocol(data).reduce((total, group) => total + group.positions.length, 0),
            flex: 1
          },
          rewards: {
            label: "Rewards",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => 
                sum + (pos.rewards?.reduce((rewardSum, reward) => rewardSum + (reward.totalPrice || 0), 0) || 0), 0
              ), 0
            )),
            flex: 1
          },
          balance: {
            label: "Balance",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => 
                sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
              ), 0
            )),
            flex: 1,
            highlight: true
          },
          percentage: {
            label: "%",
            value: (() => {
              const totalValue = groupDefiByProtocol(data).reduce((total, group) => 
                total + group.positions.reduce((sum, pos) => 
                  sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
                ), 0
              )
              return calculatePercentage(totalValue, getTotalPortfolioValue())
            })(),
            flex: 0.8
          }
        }
      
      case 'lending':
        return {
          positions: {
            label: "Positions",
            value: groupDefiByProtocol(data).length,
            flex: 1
          },
          supplied: {
            label: "Supplied",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => 
                sum + (pos.tokens?.filter(token => token.type === 'supplied')
                  .reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
              ), 0
            )),
            flex: 1.5
          },
          borrowed: {
            label: "Borrowed", 
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => 
                sum + (pos.tokens?.filter(token => token.type === 'borrowed')
                  .reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
              ), 0
            )),
            flex: 1.5
          },
          balance: {
            label: "Net Balance",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => sum + (parseFloat(pos.balance) || 0), 0), 0
            )),
            flex: 2,
            highlight: true
          }
        }
      
      case 'staking':
        return {
          positions: {
            label: "Positions",
            value: groupDefiByProtocol(data).length,
            flex: 1
          },
          staked: {
            label: "Staked",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => 
                sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
              ), 0
            )),
            flex: 1.5
          },
          unclaimed: {
            label: "Unclaimed",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => sum + (parseFloat(pos.totalUnclaimed) || 0), 0), 0
            )),
            flex: 1.5
          },
          balance: {
            label: "Total Value",
            value: formatPrice(groupDefiByProtocol(data).reduce((total, group) => 
              total + group.positions.reduce((sum, pos) => sum + (parseFloat(pos.balance) || 0), 0), 0
            )),
            flex: 2,
            highlight: true
          }
        }
      
      default:
        return {}
    }
  }

  return (
    <CollapsibleMenu
      title={title}
      isExpanded={isExpanded}
      onToggle={onToggle}
      level={0}
      columns={getMenuColumns()}
    >
      <div style={{ backgroundColor: 'white', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {groupDefiByProtocol(data).map((protocolGroup, protocolIndex) => (
          <ProtocolGroup
            key={protocolGroup.protocol.name}
            protocolGroup={protocolGroup}
            protocolIndex={protocolIndex}
            totalProtocols={groupDefiByProtocol(data).length}
            protocolExpansions={protocolExpansions}
            toggleProtocolExpansion={toggleProtocolExpansion}
            menuType={menuType}
          />
        ))}
      </div>
    </CollapsibleMenu>
  )
}

const ProtocolGroup = ({ 
  protocolGroup, 
  protocolIndex, 
  totalProtocols, 
  protocolExpansions, 
  toggleProtocolExpansion, 
  menuType 
}) => {
  const getProtocolColumns = () => {
    switch (menuType) {
      case 'liquidity':
        return {
          pools: {
            label: "Pools",
            value: protocolGroup.positions.length,
            flex: 1
          },
          rewards: {
            label: "Rewards", 
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => 
              sum + (pos.rewards?.reduce((rewardSum, reward) => rewardSum + (reward.totalPrice || 0), 0) || 0), 0
            )),
            flex: 1.5
          },
          balance: {
            label: "Balance",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => 
              sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
            )),
            flex: 2,
            highlight: true
          }
        }
      
      case 'lending':
        return {
          positions: {
            label: "Positions",
            value: protocolGroup.positions.length,
            flex: 1
          },
          supplied: {
            label: "Supplied",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => 
              sum + (pos.tokens?.filter(token => token.type === 'supplied')
                .reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
            )),
            flex: 1.5
          },
          borrowed: {
            label: "Borrowed",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => 
              sum + (pos.tokens?.filter(token => token.type === 'borrowed')
                .reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
            )),
            flex: 1.5
          },
          balance: {
            label: "Net Balance",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => sum + (parseFloat(pos.balance) || 0), 0)),
            flex: 2,
            highlight: true
          }
        }
      
      case 'staking':
        return {
          positions: {
            label: "Positions",
            value: protocolGroup.positions.length,
            flex: 1
          },
          staked: {
            label: "Staked",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => 
              sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
            )),
            flex: 1.5
          },
          unclaimed: {
            label: "Unclaimed",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => sum + (parseFloat(pos.totalUnclaimed) || 0), 0)),
            flex: 1.5
          },
          balance: {
            label: "Total Value",
            value: formatPrice(protocolGroup.positions.reduce((sum, pos) => sum + (parseFloat(pos.balance) || 0), 0)),
            flex: 2,
            highlight: true
          }
        }
      
      default:
        return {}
    }
  }

  return (
    <div style={{ 
      borderBottom: protocolIndex < totalProtocols - 1 ? '1px solid #e9ecef' : 'none'
    }}>
      <CollapsibleMenu
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(protocolGroup.protocol.logoURI || protocolGroup.protocol.logo) && (
              <img 
                src={protocolGroup.protocol.logoURI || protocolGroup.protocol.logo} 
                alt={protocolGroup.protocol.name}
                style={{ 
                  width: 20, 
                  height: 20, 
                  marginRight: 8,
                  borderRadius: '50%'
                }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            {protocolGroup.protocol.name}
          </div>
        }
        isExpanded={protocolExpansions[protocolGroup.protocol.name] || false}
        onToggle={() => toggleProtocolExpansion(protocolGroup.protocol.name)}
        columns={getProtocolColumns()}
        isNested={true}
        level={1}
      >
        {menuType === 'liquidity' ? (
          <LiquidityPositions protocolGroup={protocolGroup} />
        ) : (
          <StandardPositions protocolGroup={protocolGroup} menuType={menuType} />
        )}
      </CollapsibleMenu>
    </div>
  )
}

const LiquidityPositions = ({ protocolGroup }) => (
  <div style={{
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0'
  }}>
    {Object.entries(groupTokensByPool(protocolGroup.positions)).map(([poolName, poolData], poolIndex) => {
      const poolKey = `pool-${protocolGroup.protocol.name}-${poolIndex}`;
      
      const poolTitle = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {poolData.tokens.map((token, tokenIndex) => (
            <React.Fragment key={`${poolKey}-logo-${tokenIndex}`}>
              {token.logo && (
                <img 
                  src={token.logo} 
                  alt={token.symbol}
                  style={{ 
                    width: 18, 
                    height: 18, 
                    marginRight: 4,
                    borderRadius: '50%',
                    border: '1px solid #e0e0e0'
                  }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <span style={{ marginRight: tokenIndex < poolData.tokens.length - 1 ? 4 : 0 }}>
                {token.symbol}
              </span>
              {tokenIndex < poolData.tokens.length - 1 && (
                <span style={{ margin: '0 4px', color: '#666' }}>/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );

      return (
        <div key={poolKey} style={{ marginBottom: '8px' }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#495057',
            fontSize: '13px'
          }}>
            {poolTitle}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingLeft: '12px',
            border: '1px solid #e0e0e0'
          }}>
            {poolData.tokens.map((token, tokenIndex) => {
              const correspondingReward = poolData.rewards?.find(reward => reward.symbol === token.symbol)
              const tokenReward = correspondingReward ? correspondingReward.totalPrice || 0 : 0;
              
              return (
                <TokenRow
                  key={`${protocolGroup.protocol.name}-pool-${poolIndex}-token-${tokenIndex}`}
                  token={token}
                  tokenReward={tokenReward}
                  isLast={tokenIndex === poolData.tokens.length - 1}
                />
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

const StandardPositions = ({ protocolGroup, menuType }) => (
  <div style={{ padding: '16px', backgroundColor: '#f8f9fa' }}>
    {protocolGroup.positions.map((position, positionIndex) => {
      const positionKey = `defi-${protocolGroup.protocol.id}-${positionIndex}`;
      
      return (
        <div key={positionKey} style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '8px', 
            color: '#495057',
            fontSize: '13px'
          }}>
            {position.name || `Position ${positionIndex + 1}`}
            {menuType === 'staking' && position.apr && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '2px 6px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                APR: {position.apr}%
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingLeft: '12px'
          }}>
            {position.tokens?.map((token, tokenIndex) => (
              <TokenRow
                key={`${positionKey}-token-${tokenIndex}`}
                token={token}
                isLast={tokenIndex === position.tokens.length - 1}
                showType={menuType === 'lending'}
              />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const TokenRow = ({ token, tokenReward, isLast, showType }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: isLast ? '0' : '6px',
    border: '1px solid #e9ecef',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#f8f9fa'
    e.currentTarget.style.transform = 'translateY(-1px)'
    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'white'
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
  }}
>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {token.logo && (
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
        onError={(e) => e.target.style.display = 'none'}
      />
    )}
    <span style={{ 
      fontWeight: '600', 
      fontSize: '14px',
      color: '#212529'
    }}>{token.symbol}</span>
    {showType && token.type && (
      <span style={{
        marginLeft: '8px',
        backgroundColor: token.type === 'supplied' ? '#d4edda' : '#f8d7da',
        color: token.type === 'supplied' ? '#155724' : '#721c24',
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500'
      }}>
        {token.type}
      </span>
    )}
  </div>
  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
    {tokenReward !== undefined && (
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>Rewards</div>
        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '500' }}>
          {formatPrice(tokenReward)}
        </span>
      </div>
    )}
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>Balance</div>
      <span style={{ 
        fontFamily: 'monospace', 
        fontSize: '14px', 
        fontWeight: '600',
        color: '#212529'
      }}>
        {formatPrice(token.totalPrice || 0)}
      </span>
    </div>
  </div>
</div>
);

export default DeFiMenu
