import React from 'react'
import CollapsibleMenu from './CollapsibleMenu'
import { formatBalance, formatPrice, getFilteredTokens } from '../utils/walletUtils'

const TokensMenu = ({ 
  title, 
  tokens, 
  isExpanded, 
  onToggle, 
  getTotalPortfolioValue,
  calculatePercentage,
  showOptionsMenu = false,
  optionsExpanded,
  toggleOptionsExpanded,
  searchTerm,
  setSearchTerm,
  selectedChains,
  setSelectedChains,
  selectedTokenTypes,
  setSelectedTokenTypes
}) => {
  if (!tokens || tokens.length === 0) return null

  const filteredTokens = getFilteredTokens(tokens, searchTerm, selectedChains, selectedTokenTypes)
  
  const totalValue = filteredTokens.reduce((sum, token) => {
    const price = parseFloat(token.totalPrice) || 0
    return sum + (isNaN(price) ? 0 : price)
  }, 0)

  const getTokenColumns = () => ({
    tokens: {
      label: "Tokens",
      value: filteredTokens.length,
      flex: 1
    },
    balance: {
      label: "Balance",
      value: formatPrice(totalValue),
      flex: 2,
      highlight: true
    },
    percentage: {
      label: "%",
      value: calculatePercentage(totalValue, getTotalPortfolioValue()),
      flex: 0.8
    }
  })

  return (
    <CollapsibleMenu
      title={title}
      isExpanded={isExpanded}
      onToggle={onToggle}
      level={0}
      columns={getTokenColumns()}
      showOptionsMenu={showOptionsMenu}
      optionsExpanded={optionsExpanded}
      toggleOptionsExpanded={toggleOptionsExpanded}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedChains={selectedChains}
      setSelectedChains={setSelectedChains}
      selectedTokenTypes={selectedTokenTypes}
      setSelectedTokenTypes={setSelectedTokenTypes}
      tokens={tokens}
    >
      <TokenTable tokens={filteredTokens} />
    </CollapsibleMenu>
  )
}

const TokenTable = ({ tokens }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
        <th style={{ 
          padding: '12px 20px', 
          textAlign: 'left', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '13px',
          letterSpacing: '0.5px'
        }}>
          TOKEN
        </th>
        <th style={{ 
          padding: '12px 20px', 
          textAlign: 'right', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '13px',
          letterSpacing: '0.5px'
        }}>
          BALANCE
        </th>
        <th style={{ 
          padding: '12px 20px', 
          textAlign: 'right', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '13px',
          letterSpacing: '0.5px'
        }}>
          PRICE
        </th>
        <th style={{ 
          padding: '12px 20px', 
          textAlign: 'right', 
          fontWeight: '600', 
          color: '#495057',
          fontSize: '13px',
          letterSpacing: '0.5px'
        }}>
          VALUE
        </th>
      </tr>
    </thead>
    <tbody>
      {tokens.map((token, index) => (
        <TokenRow key={index} token={token} isLast={index === tokens.length - 1} />
      ))}
    </tbody>
  </table>
)

const TokenRow = ({ token, isLast }) => {
  // Extract token data based on structure (nested or direct)
  const tokenData = token.tokenData?.token || token
  const logo = tokenData.logo || tokenData.logoURI || token.logo || token.logoURI
  const symbol = tokenData.symbol || token.symbol
  const name = tokenData.name || token.name
  const chain = token.chain
  const balance = token.balance || token.tokenData?.balance
  const price = token.price || token.tokenData?.price
  const totalPrice = token.totalPrice

  return (
    <tr style={{ 
      borderBottom: isLast ? 'none' : '1px solid #e9ecef',
      transition: 'background-color 0.15s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {logo && (
            <img 
              src={logo} 
              alt={symbol}
              style={{ 
                width: 32, 
                height: 32, 
                marginRight: 12,
                borderRadius: '50%',
                border: '1px solid #e0e0e0'
              }}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div>
            <div style={{ 
              fontWeight: '600', 
              fontSize: '14px',
              color: '#212529',
              marginBottom: '2px'
            }}>
              {symbol}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{name}</span>
              {chain && (
                <span style={{
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '500'
                }}>
                  {chain}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', color: '#495057' }}>
        {balance ? formatBalance(balance) : 'N/A'}
      </td>
      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', color: '#495057' }}>
        {price ? formatPrice(price) : 'N/A'}
      </td>
      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#212529' }}>
        {formatPrice(totalPrice)}
      </td>
    </tr>
  )
}

export default TokensMenu
