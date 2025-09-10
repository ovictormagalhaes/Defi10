import React, { useEffect, useState } from 'react'
import CollapsibleMenu from './components/CollapsibleMenu'
import TokensMenu from './components/TokensMenu'
import DeFiMenu from './components/DeFiMenu'
import { useWalletConnection, useWalletData, useTooltip } from './hooks/useWallet'
import useWalletMenus from './hooks/useWalletMenus'
import colors from './styles/colors'
import PoolTokenCell from './components/PoolTokenCell'
import CellsContainer from './components/CellsContainer'
import { 
  formatBalance, 
  formatNativeBalance, 
  formatPrice, 
  groupDefiByProtocol, 
  getFilteredTokens,
  groupTokensByPool,
  groupTokensByType,
  groupStakingTokensByType,
  ITEM_TYPES,
  filterItemsByType,
  getWalletTokens,
  getLiquidityPools,
  getLendingAndBorrowingPositions,
  getStakingPositions
} from './utils/walletUtils'
import { 
  DEFAULT_COLUMN_VISIBILITY, 
  DEFAULT_EXPANSION_STATES, 
  DEFAULT_FILTER_SETTINGS 
} from './constants/config'

export default function App() {
  // Wallet connection hook
  const { account, loading, setLoading, connectWallet, copyAddress, disconnect } = useWalletConnection()
  
  // Wallet data hook
  const { walletData, callAccountAPI, refreshWalletData } = useWalletData()
  
  // Tooltip hook
  const { tooltipVisible, tooltipPosition, showTooltip, hideTooltip, setTooltipPosition } = useTooltip()
  
  // UI state from constants
  const [showOnlyPositiveBalance, setShowOnlyPositiveBalance] = useState(DEFAULT_FILTER_SETTINGS.showOnlyPositiveBalance)
  const [showLendingDefiTokens, setShowLendingDefiTokens] = useState(false) // Lending: hide internal by default
  const [showStakingDefiTokens, setShowStakingDefiTokens] = useState(false) // Staking: hide internal by default
  const [searchAddress, setSearchAddress] = useState('') // Address search input
  const [liquidityPoolsExpanded, setLiquidityPoolsExpanded] = useState(DEFAULT_EXPANSION_STATES.liquidityPoolsExpanded)
  const [tokensExpanded, setTokensExpanded] = useState(DEFAULT_EXPANSION_STATES.tokensExpanded)
  const [lendingAndBorrowingExpanded, setLendingAndBorrowingExpanded] = useState(DEFAULT_EXPANSION_STATES.defiPositionsExpanded)
  const [stakingExpanded, setStakingExpanded] = useState(DEFAULT_EXPANSION_STATES.stakingExpanded || false)
  
  // Column visibility states
  const [showBalanceColumn, setShowBalanceColumn] = useState(DEFAULT_COLUMN_VISIBILITY.showBalanceColumn)
  const [showUnitPriceColumn, setShowUnitPriceColumn] = useState(DEFAULT_COLUMN_VISIBILITY.showUnitPriceColumn)
  
  // Protocol expansion states for nested menus
  const [protocolExpansions, setProtocolExpansions] = useState({})

  // Pool expansion states for individual pools within protocols
  const [defaultStates, setDefaultStates] = useState({})

  // Function to toggle protocol expansion
  const toggleProtocolExpansion = (protocolName) => {
    setProtocolExpansions(prev => ({
      ...prev,
      [protocolName]: !prev[protocolName]
    }))
  }

  // Refresh wallet data wrapper
  const handleRefreshWalletData = () => {
    refreshWalletData(account, setLoading)
  }

  // Search for wallet data by address
  const handleSearchWallet = async () => {
    if (!searchAddress.trim()) {
      alert('Please enter a wallet address')
      return
    }
    
    // Basic validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(searchAddress.trim())) {
      alert('Please enter a valid Ethereum address (0x...)')
      return
    }
    
    console.log('Searching wallet:', searchAddress.trim())
    setLoading(true)
    
    try {
      // Call the API directly and wait for the response
      await callAccountAPI(searchAddress.trim(), setLoading)
      console.log('Search completed, walletData should be updated')
    } catch (error) {
      console.error('Error searching wallet:', error)
      alert('Error searching wallet data. Please try again.')
      setLoading(false)
    }
  }

  // Filters specific to each section
  const filterLendingDefiTokens = (tokens, showInternal) => {
    if (!Array.isArray(tokens)) return []
    // Hide tokens flagged as protocol/internal tokens by default
    return showInternal ? tokens : tokens.filter(t => (t.type || '').toLowerCase() !== 'defi-token')
  }

  const filterStakingDefiTokens = (tokens, showInternal) => {
    if (!Array.isArray(tokens)) return []
    if (showInternal) return tokens
    // Hide reward tokens by default (and any defi-token just in case)
    return tokens.filter(t => {
      const ty = (t.type || '').toLowerCase()
      return ty !== 'reward' && ty !== 'rewards' && ty !== 'defi-token'
    })
  }

  // Calculate total portfolio value
  const getTotalPortfolioValue = () => {
    if (!walletData) return 0
    
    let total = 0
    
    // Use helper functions that handle both new unified structure (items) and legacy structures
    // Wallet tokens
    total += getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance)
      .reduce((sum, tokenData) => {
        const token = tokenData.token || tokenData
        return sum + parseFloat(token.totalPrice || 0)
      }, 0)
    
    // Liquidity pools - use position.balance directly
    total += getLiquidityPoolsData().reduce((sum, defi) => {
      const balance = parseFloat(defi.position?.balance) || 0
      return sum + (isNaN(balance) ? 0 : balance)
    }, 0)
    
  // Lending & Borrowing positions (net: supplied - borrowed)
  total += groupDefiByProtocol(getLendingAndBorrowingData()).reduce((grand, group) => {
      const groupSum = group.positions.reduce((sum, pos) => {
    const tokens = Array.isArray(pos.tokens) ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens) : []
        const net = tokens.reduce((s, t) => {
          const ty = (t.type || '').toLowerCase()
          const val = parseFloat(t.totalPrice) || 0
          const signed = (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') ? -Math.abs(val) : val
          return s + signed
        }, 0)
        return sum + net
      }, 0)
      return grand + groupSum
    }, 0)
    
    // Staking positions (sum tokens totalPrice honoring staking internal toggle)
  total += groupDefiByProtocol(getStakingData()).reduce((grand, group) => {
      const groupSum = group.positions.reduce((sum, pos) => {
    const tokens = Array.isArray(pos.tokens) ? filterStakingDefiTokens(pos.tokens, showStakingDefiTokens) : []
        return sum + tokens.reduce((s, t) => s + (parseFloat(t.totalPrice) || 0), 0)
      }, 0)
      return grand + groupSum
    }, 0)
    
    return total
  }

  // Helper functions to get data based on structure
  const getWalletTokensData = () => {
    // New unified structure with items array
    if (walletData.items && Array.isArray(walletData.items)) {
      return filterItemsByType(walletData.items, ITEM_TYPES.WALLET)
    }
    // Legacy structure support
    if (walletData.data && Array.isArray(walletData.data)) {
      return getWalletTokens(walletData.data)
    }
    return walletData.tokens || []
  }

  const getLiquidityPoolsData = () => {
    // New unified structure with items array
    if (walletData.items && Array.isArray(walletData.items)) {
      return filterItemsByType(walletData.items, ITEM_TYPES.LIQUIDITY_POOL)
    }
    // Legacy structure support
    if (walletData.data && Array.isArray(walletData.data)) {
      return getLiquidityPools(walletData.data)
    }
    return walletData.liquidityPools || []
  }

  const getLendingAndBorrowingData = () => {
    // New unified structure with items array
    if (walletData.items && Array.isArray(walletData.items)) {
      return filterItemsByType(walletData.items, ITEM_TYPES.LENDING_AND_BORROWING)
    }
    // Legacy structure support
    if (walletData.data && Array.isArray(walletData.data)) {
      return getLendingAndBorrowingPositions(walletData.data)
    }
    return walletData.lendingAndBorrowing || []
  }

  const getStakingData = () => {
    // New unified structure with items array
    if (walletData.items && Array.isArray(walletData.items)) {
      return filterItemsByType(walletData.items, ITEM_TYPES.STAKING)
    }
    // Legacy structure support
    if (walletData.data && Array.isArray(walletData.data)) {
      return getStakingPositions(walletData.data)
    }
    return walletData.staking || []
  }

  // Calculate percentage of total
  const calculatePercentage = (value, total) => {
    if (total === 0 || isNaN(total) || isNaN(value)) return "0%"
    const percentage = (value / total) * 100
    return `${percentage.toFixed(1)}%`
  }

  // Call API when account changes
  useEffect(() => {
    if (account) {
      callAccountAPI(account, setLoading)
    }
  }, [account, callAccountAPI])

  // Debug: Monitor walletData changes
  useEffect(() => {
    console.log('WalletData updated:', walletData)
  }, [walletData])

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: 20, 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh' 
    }}>
      {/* Modern Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>🌐</span>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px'
              }}>
                Defi10
              </h1>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '400'
              }}>
                Web3 Portfolio Explorer
              </p>
            </div>
          </div>

          {/* Account Info and Actions */}
          {!account ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Address Input */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Enter wallet address (0x...)"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '14px',
                    width: '300px',
                    backdropFilter: 'blur(10px)',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.15)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.5)'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchWallet()
                    }
                  }}
                />
                <button 
                  onClick={handleSearchWallet}
                  disabled={!searchAddress.trim()}
                  style={{ 
                    background: searchAddress.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: searchAddress.trim() ? 'white' : 'rgba(255,255,255,0.5)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: searchAddress.trim() ? 'pointer' : 'not-allowed',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    minWidth: '80px'
                  }}
                  onMouseEnter={(e) => {
                    if (searchAddress.trim()) {
                      e.target.style.background = 'rgba(255,255,255,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchAddress.trim()) {
                      e.target.style.background = 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  🔍 Search
                </button>
              </div>
              
              {/* Connect Wallet Button */}
              <button 
                onClick={connectWallet} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                }}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Account Badge */}
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4ade80',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
                }}></div>
                <div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    Connected Account
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={copyAddress}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.25)'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.15)'
                    e.target.style.transform = 'translateY(0)'
                  }}
                  title="Copy address to clipboard"
                >
                  📋 Copy
                </button>
                
                <button 
                  onClick={handleRefreshWalletData}
                  disabled={loading}
                  style={{
                    background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: loading ? 'rgba(255,255,255,0.5)' : 'white',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.background = 'rgba(255,255,255,0.25)'
                      e.target.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.background = 'rgba(255,255,255,0.15)'
                      e.target.style.transform = 'translateY(0)'
                    }
                  }}
                  title="Refresh wallet data"
                >
                  {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
                
                <button 
                  onClick={disconnect}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fecaca',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.3)'
                    e.target.style.color = 'white'
                    e.target.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                    e.target.style.color = '#fecaca'
                    e.target.style.transform = 'translateY(0)'
                  }}
                  title="Disconnect wallet"
                >
                  🚪 Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%'
            }}></div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
              Loading wallet data...
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      {walletData && (
        <div>
          {/* Tokens Table */}
          {walletData && getWalletTokensData().length > 0 && (
            <CollapsibleMenu
              title="Wallet"
              isExpanded={tokensExpanded}
              onToggle={() => setTokensExpanded(!tokensExpanded)}
              columns={{
                tokens: { 
                  label: "Tokens", 
                  value: getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance).length,
                  flex: 1 
                },
                empty: {
                  label: "",
                  value: "",
                  flex: 1
                },
                balance: { 
                  label: "Balance", 
                  value: formatPrice(getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance).reduce((sum, tokenData) => {
                    const token = tokenData.token || tokenData // Support both old and new structure
                    return sum + parseFloat(token.totalPrice || 0)
                  }, 0)),
                  flex: 1,
                  highlight: true 
                },
                percentage: {
                  label: "%",
                  value: (() => {
                    const walletValue = getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance).reduce((sum, tokenData) => {
                      const token = tokenData.token || tokenData // Support both old and new structure
                      return sum + parseFloat(token.totalPrice || 0)
                    }, 0)
                    const totalValue = getTotalPortfolioValue()
                    return calculatePercentage(walletValue, totalValue)
                  })(),
                  flex: 0.8
                }
              }}
              level={0}
              optionsMenu={
                <div style={{ padding: '8px 16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={!showOnlyPositiveBalance}
                      onChange={(e) => setShowOnlyPositiveBalance(!e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    Show assets with no balance
                  </label>
                  
                  <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '8px', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                      Visible Columns:
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginBottom: '6px' }}>
                      <input
                        type="checkbox"
                        checked={showBalanceColumn}
                        onChange={(e) => setShowBalanceColumn(e.target.checked)}
                        style={{ marginRight: 8 }}
                      />
                      Amount
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={showUnitPriceColumn}
                        onChange={(e) => setShowUnitPriceColumn(e.target.checked)}
                        style={{ marginRight: 8 }}
                      />
                      Price
                    </label>
                    
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                      Token and Total Value are always visible
                    </div>
                  </div>
                </div>
              }
            >
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                borderRadius: '0 0 12px 12px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef',
                borderTop: 'none'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Token</th>
                    {showBalanceColumn && (
                      <th style={{ padding: '16px 20px', textAlign: 'right', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Amount</th>
                    )}
                    {showUnitPriceColumn && (
                      <th style={{ padding: '16px 20px', textAlign: 'right', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Price</th>
                    )}
                    <th style={{ padding: '16px 20px', textAlign: 'right', borderBottom: '1px solid #dee2e6', fontWeight: '600', fontSize: '14px', color: '#495057' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance).map((tokenData, index) => {
                    const token = tokenData.token || tokenData // Support both old and new structure
                    return (
                    <tr key={token.contractAddress || token.tokenAddress} style={{ 
                      borderBottom: index < getFilteredTokens(getWalletTokensData(), showOnlyPositiveBalance).length - 1 ? '1px solid #f1f3f4' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
                        {token.logo && (
                          <img 
                            src={token.logo} 
                            alt={token.symbol}
                            style={{ 
                              width: 28, 
                              height: 28, 
                              marginRight: 12,
                              borderRadius: '50%',
                              border: '1px solid #e0e0e0'
                            }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: '#212529', marginBottom: '2px' }}>{token.symbol}</div>
                          <div style={{ fontSize: '13px', color: '#6c757d' }}>{token.name}</div>
                        </div>
                      </td>
                      {showBalanceColumn && (
                        <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: '#495057' }}>
                          {formatBalance(token.balance, token.native)}
                        </td>
                      )}
                      {showUnitPriceColumn && (
                        <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', color: '#495057' }}>
                          {formatPrice(token.price)}
                        </td>
                      )}
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                        {formatPrice(token.totalPrice)}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </CollapsibleMenu>
          )}

          {/* DeFi Tables */}
          {walletData && (getLiquidityPoolsData().length > 0 || getLendingAndBorrowingData().length > 0 || getStakingData().length > 0) && (
            <>
              {/* Liquidity Pools Table */}
              {getLiquidityPoolsData().length > 0 && (
                <CollapsibleMenu
                  title="Liquidity Pools"
                  isExpanded={liquidityPoolsExpanded}
                  onToggle={() => setLiquidityPoolsExpanded(!liquidityPoolsExpanded)}
                  level={0}
                  columns={{
                    pools: {
                      label: "Pools",
                      value: groupDefiByProtocol(getLiquidityPoolsData()).reduce((total, group) => total + group.positions.length, 0),
                      flex: 1
                    },
                    rewards: {
                      label: "Rewards",
                      value: formatPrice(groupDefiByProtocol(getLiquidityPoolsData()).reduce((total, group) => {
                        return total + group.positions.reduce((sum, pos) => {
                          // Sum rewards from tokens typed as reward(s) OR from position.rewards array
                          const tokenRewards = Array.isArray(pos.tokens)
                            ? pos.tokens.reduce((rSum, t) => {
                                const tType = (t.type || '').toString().toLowerCase()
                                if (tType === 'reward' || tType === 'rewards') {
                                  return rSum + (parseFloat(t.totalPrice) || 0)
                                }
                                return rSum
                              }, 0)
                            : 0
                          const arrayRewards = Array.isArray(pos.rewards)
                            ? pos.rewards.reduce((rSum, r) => rSum + (parseFloat(r.totalPrice) || 0), 0)
                            : 0
                          return sum + tokenRewards + arrayRewards
                        }, 0)
                      }, 0)),
                      flex: 1
                    },
                    balance: {
                      label: "Balance",
                      value: formatPrice(groupDefiByProtocol(getLiquidityPoolsData()).reduce((total, group) => 
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
                        const liquidityValue = groupDefiByProtocol(getLiquidityPoolsData()).reduce((total, group) => 
                          total + group.positions.reduce((sum, pos) => 
                            sum + (pos.tokens?.reduce((tokenSum, token) => tokenSum + (token.totalPrice || 0), 0) || 0), 0
                          ), 0
                        )
                        const totalValue = getTotalPortfolioValue()
                        return calculatePercentage(liquidityValue, totalValue)
                      })(),
                      flex: 0.8
                    }
                  }}
                >
                  {/* Hierarchical nested structure */}
                  <div style={{ backgroundColor: 'white', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                    {groupDefiByProtocol(getLiquidityPoolsData()).map((protocolGroup, protocolIndex) => (
                      <div key={protocolGroup.protocol.name} style={{ 
                        borderBottom: protocolIndex < groupDefiByProtocol(getLiquidityPoolsData()).length - 1 ? '1px solid #e9ecef' : 'none'
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
                          columns={{
                            pools: {
                              label: "Pools",
                              value: protocolGroup.positions.length,
                              flex: 1
                            },
                            rewards: {
                              label: "Rewards", 
                              value: formatPrice(protocolGroup.positions.reduce((sum, pos) => {
                                const tokenRewards = Array.isArray(pos.tokens)
                                  ? pos.tokens.reduce((rSum, t) => {
                                      const tType = (t.type || '').toString().toLowerCase()
                                      if (tType === 'reward' || tType === 'rewards') {
                                        return rSum + (parseFloat(t.totalPrice) || 0)
                                      }
                                      return rSum
                                    }, 0)
                                  : 0
                                const arrayRewards = Array.isArray(pos.rewards)
                                  ? pos.rewards.reduce((rSum, r) => rSum + (parseFloat(r.totalPrice) || 0), 0)
                                  : 0
                                return sum + tokenRewards + arrayRewards
                              }, 0)),
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
                          }}
                          isNested={true} // Indica que é um menu aninhado
                          level={1}
                        >
                            {/* Pool submenus within this protocol */}
                            {Object.entries(groupTokensByPool(protocolGroup.positions)).map(([poolName, poolData], poolIndex) => {
                              const poolRewardsTotal = poolData.rewards ? poolData.rewards.reduce((sum, reward) => sum + (reward?.totalPrice || 0), 0) : 0;
                              const poolKey = `pool-${protocolGroup.protocol.name}-${poolIndex}`;
                              
                              // Cria o título do pool com logos dos tokens
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
                                <CollapsibleMenu 
                                  key={poolKey}
                                  title={poolTitle}
                                  isExpanded={defaultStates[poolKey] || false}
                                  onToggle={() => setDefaultStates(prev => ({ ...prev, [poolKey]: !prev[poolKey] }))}
                                  columns={{
                                    rewards: {
                                      label: "Rewards",
                                      value: formatPrice(poolRewardsTotal),
                                      flex: 1
                                    },
                                    balance: {
                                      label: "Balance",
                                      value: formatPrice(poolData.totalValue),
                                      flex: 2,
                                      highlight: true
                                    }
                                  }}
                                  isNested={true}
                                  level={2}
                                >
                                  {/* Individual token cells within this pool */}
                                  <CellsContainer>
                                    {poolData.tokens.map((token, tokenIndex) => {
                                      const correspondingReward = poolData.rewards?.find(reward => reward.symbol === token.symbol)
                                      const tokenReward = correspondingReward ? correspondingReward.totalPrice || 0 : 0
                                      const isLast = !(tokenIndex < poolData.tokens.length - 1)
                                      return (
                                        <PoolTokenCell
                                          key={`${protocolGroup.protocol.name}-pool-${poolIndex}-token-${tokenIndex}`}
                                          token={token}
                                          rewardText={formatPrice(tokenReward)}
                                          balanceText={formatPrice(token.totalPrice || 0)}
                                          isLast={isLast}
                                        />
                                      )
                                    })}
                                  </CellsContainer>
                                </CollapsibleMenu>
                              );
                            })}
                          </CollapsibleMenu>
                      </div>
                    ))}
                  </div>
                </CollapsibleMenu>
              )}

              {/* Other Lending & Borrowing Table */}
              {getLendingAndBorrowingData().length > 0 && (
                <CollapsibleMenu
                  title="Lending & Borrowing"
                  isExpanded={lendingAndBorrowingExpanded}
                  onToggle={() => setLendingAndBorrowingExpanded(!lendingAndBorrowingExpanded)}
                  level={0}
                  columns={{
                    protocols: {
                      label: "Protocols",
                      value: groupDefiByProtocol(getLendingAndBorrowingData()).length,
                      flex: 1
                    },
                    empty: {
                      label: "",
                      value: "",
                      flex: 1
                    },
                    balance: {
                      label: "Balance",
                      value: (() => {
                        const defiValue = groupDefiByProtocol(getLendingAndBorrowingData()).reduce((grand, group) => {
                          const groupSum = group.positions.reduce((sum, pos) => {
                            const tokens = Array.isArray(pos.tokens) ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens) : []
                            const net = tokens.reduce((s, t) => {
                              const ty = (t.type || '').toLowerCase()
                              const val = parseFloat(t.totalPrice) || 0
                              const signed = (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') ? -Math.abs(val) : val
                              return s + signed
                            }, 0)
                            return sum + net
                          }, 0)
                          return grand + groupSum
                        }, 0)
                        return formatPrice(defiValue)
                      })(),
                      flex: 1,
                      highlight: true
                    },
                    percentage: {
                      label: "%",
                      value: (() => {
                        const defiValue = groupDefiByProtocol(getLendingAndBorrowingData()).reduce((grand, group) => {
                          const groupSum = group.positions.reduce((sum, pos) => {
                            const tokens = Array.isArray(pos.tokens) ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens) : []
                            const net = tokens.reduce((s, t) => {
                              const ty = (t.type || '').toLowerCase()
                              const val = parseFloat(t.totalPrice) || 0
                              const signed = (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') ? -Math.abs(val) : val
                              return s + signed
                            }, 0)
                            return sum + net
                          }, 0)
                          return grand + groupSum
                        }, 0)
                        const totalValue = getTotalPortfolioValue()
                        return calculatePercentage(defiValue, totalValue)
                      })(),
                      flex: 0.8
                    }
                  }}
                  optionsMenu={
                    <div style={{ padding: '8px 16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={showLendingDefiTokens}
                          onChange={(e) => setShowLendingDefiTokens(e.target.checked)}
                          style={{ marginRight: 8 }}
                        />
                        Show internal DeFi tokens
                      </label>
                      
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>
                        Internal tokens (like debt tokens) are hidden by default
                      </div>
                    </div>
                  }
                >
                  {/* Hierarchical nested structure for DeFi */}
                  <div style={{ backgroundColor: 'white', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                    {groupDefiByProtocol(getLendingAndBorrowingData()).map((protocolGroup, protocolIndex) => (
                      <div key={protocolGroup.protocol.id} style={{ 
                        borderBottom: protocolIndex < groupDefiByProtocol(getLendingAndBorrowingData()).length - 1 ? '1px solid #e9ecef' : 'none'
                      }}>
                        <CollapsibleMenu
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {protocolGroup.protocol.logo && (
                                <img 
                                  src={protocolGroup.protocol.logo} 
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
                          columns={{
                            positions: {
                              label: "Positions",
                              value: protocolGroup.positions.length,
                              flex: 1
                            },
                            balance: {
                              label: "Balance",
                              value: formatPrice(protocolGroup.positions.reduce((sum, pos) => {
                                const tokens = Array.isArray(pos.tokens) ? filterLendingDefiTokens(pos.tokens, showLendingDefiTokens) : []
                                const net = tokens.reduce((s, t) => {
                                  const ty = (t.type || '').toLowerCase()
                                  const val = parseFloat(t.totalPrice) || 0
                                  const signed = (ty === 'borrowed' || ty === 'borrow' || ty === 'debt') ? -Math.abs(val) : val
                                  return s + signed
                                }, 0)
                                return sum + net
                              }, 0)),
                              flex: 2,
                              highlight: true
                            }
                          }}
                          isNested={true}
                          level={1}
                        >
                          {/* Group tokens by type (supplied/borrowed) within this protocol */}
                          {(() => {
                            const filteredPositions = protocolGroup.positions.map(p => ({
                              ...p,
                              tokens: Array.isArray(p.tokens) ? filterLendingDefiTokens(p.tokens, showLendingDefiTokens) : []
                            }))
                            const groupedTokens = groupTokensByType(filteredPositions)
                            
                            return Object.entries(groupedTokens).map(([tokenType, tokens], typeIndex) => {
                              if (tokens.length === 0) return null
                              
                              const typeKey = `${protocolGroup.protocol.id}-${tokenType}`
                              const typeLabel = tokenType === 'supplied' ? 'Supplied' : 'Borrowed'
                              const totalValue = tokens.reduce((sum, token) => sum + (parseFloat(token.totalPrice) || 0), 0)
                              const displayTotal = tokenType === 'borrowed' ? -Math.abs(totalValue) : totalValue
                              
                              return (
                                <CollapsibleMenu 
                                  key={typeKey}
                                  title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ color: colors.textPrimary }}>
                                        {typeLabel}
                                      </span>
                                    </div>
                                  }
                                  isExpanded={defaultStates[typeKey] || false}
                                  onToggle={() => setDefaultStates(prev => ({ ...prev, [typeKey]: !prev[typeKey] }))}
                                  columns={{
                                    tokens: {
                                      label: "Tokens",
                                      value: tokens.length,
                                      flex: 1
                                    },
                                    balance: {
                                      label: "Balance",
                                      value: formatPrice(displayTotal),
                                      flex: 2,
                                      highlight: true
                                    }
                                  }}
                                  isNested={true}
                                  level={2}
                                >
                                  {/* Individual tokens within this type */}
                                  <CellsContainer>
                                    {tokens.map((token, tokenIndex) => (
                                      <div key={`${typeKey}-token-${tokenIndex}`} 
                                           style={{ 
                                             display: 'flex', 
                                             justifyContent: 'space-between', 
                                             alignItems: 'center',
                                             padding: '12px 16px',
                                             backgroundColor: 'white',
                                             borderRadius: '8px',
                                             marginBottom: tokenIndex < tokens.length - 1 ? '6px' : '0',
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
                                        </div>
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                          <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>Balance</div>
                                            <span style={{ 
                                              fontFamily: 'monospace', 
                                              fontSize: '14px', 
                                              fontWeight: '600',
                                              color: '#212529'
                                            }}>
                                              {(() => {
                                                const val = parseFloat(token.totalPrice) || 0
                                                const signed = tokenType === 'borrowed' ? -Math.abs(val) : val
                                                return formatPrice(signed)
                                              })()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </CellsContainer>
                                </CollapsibleMenu>
                              )
                            }).filter(Boolean)
                          })()}
                        </CollapsibleMenu>
                      </div>
                    ))}
                  </div>
                </CollapsibleMenu>
              )}

              {/* Staking Table */}
              {getStakingData().length > 0 && (
                <CollapsibleMenu
                  title="Staking"
                  isExpanded={stakingExpanded}
                  onToggle={() => setStakingExpanded(!stakingExpanded)}
                  level={0}
                  columns={{
                    protocols: {
                      label: "Protocols",
                      value: groupDefiByProtocol(getStakingData()).length,
                      flex: 1
                    },
                    empty: {
                      label: "",
                      value: "",
                      flex: 1
                    },
                    balance: {
                      label: "Balance",
                      value: (() => {
                        const stakingValue = getStakingData().reduce((total, position) => {
                          const balance = parseFloat(position.balance) || 0
                          return total + (isNaN(balance) ? 0 : balance)
                        }, 0)
                        return formatPrice(stakingValue)
                      })(),
                      flex: 1,
                      highlight: true
                    },
                    percentage: {
                      label: "%",
                      value: (() => {
                        const stakingValue = getStakingData().reduce((total, position) => {
                          const balance = parseFloat(position.balance) || 0
                          return total + (isNaN(balance) ? 0 : balance)
                        }, 0)
                        const totalValue = getTotalPortfolioValue()
                        return calculatePercentage(stakingValue, totalValue)
                      })(),
                      flex: 0.8
                    }
                  }}
                  optionsMenu={
                    <div style={{ padding: '8px 16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={showStakingDefiTokens}
                          onChange={(e) => setShowStakingDefiTokens(e.target.checked)}
                          style={{ marginRight: 8 }}
                        />
                        Show internal DeFi tokens
                      </label>
                      
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic' }}>
                        Internal tokens (like staking rewards) are hidden by default
                      </div>
                    </div>
                  }
                >
                  {/* Hierarchical nested structure for Staking */}
                  <div style={{ padding: '16px 24px', backgroundColor: '#fafafa' }}>
                    {groupDefiByProtocol(getStakingData()).map((protocolGroup, protocolIndex) => (
                      <div key={protocolGroup.protocol.name} style={{ 
                        marginBottom: protocolIndex < groupDefiByProtocol(getStakingData()).length - 1 ? '12px' : 0 
                      }}>
                        <CollapsibleMenu
                          key={protocolGroup.protocol.name}
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
                                    borderRadius: '50%',
                                    border: '1px solid #e0e0e0'
                                  }}
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              )}
                              <span>{protocolGroup.protocol.name}</span>
                            </div>
                          }
                          isExpanded={protocolExpansions[protocolGroup.protocol.name] || false}
                          onToggle={() => toggleProtocolExpansion(protocolGroup.protocol.name)}
                          columns={{
                            positions: {
                              label: "Positions",
                              value: protocolGroup.positions.length,
                              flex: 1
                            },
                            balance: {
                              label: "Balance",
                              value: formatPrice(protocolGroup.positions.reduce((sum, position) => {
                                const tokens = Array.isArray(position.tokens) ? filterStakingDefiTokens(position.tokens, showStakingDefiTokens) : []
                                const positionValue = tokens.reduce((s, t) => s + (parseFloat(t.totalPrice) || 0), 0)
                                return sum + positionValue
                              }, 0)),
                              flex: 2,
                              highlight: true
                            }
                          }}
                          isNested={true}
                          level={1}
                        >
                          {/* Group tokens by type (staked/rewards) within this protocol */}
                          {(() => {
                            const filteredStakingPositions = protocolGroup.positions.map(p => ({
                              ...p,
                              tokens: Array.isArray(p.tokens) ? filterStakingDefiTokens(p.tokens, showStakingDefiTokens) : []
                            }))
                            const groupedTokens = groupStakingTokensByType(filteredStakingPositions)
                            
                            return Object.entries(groupedTokens).map(([tokenType, tokens], typeIndex) => {
                              if (tokens.length === 0) return null
                              
                              const typeKey = `${protocolGroup.protocol.name}-${tokenType}`
                              const typeLabel = tokenType === 'staked' ? 'Staked' : 'Rewards'
                              const totalValue = tokens.reduce((sum, token) => sum + (parseFloat(token.totalPrice) || 0), 0)
                              
                              return (
                                <CollapsibleMenu 
                                  key={typeKey}
                                  title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ color: colors.textPrimary }}>
                                        {typeLabel}
                                      </span>
                                    </div>
                                  }
                                  isExpanded={defaultStates[typeKey] || false}
                                  onToggle={() => setDefaultStates(prev => ({ ...prev, [typeKey]: !prev[typeKey] }))}
                                  columns={{
                                    tokens: {
                                      label: "Tokens",
                                      value: tokens.length,
                                      flex: 1
                                    },
                                    balance: {
                                      label: "Balance",
                                      value: formatPrice(totalValue),
                                      flex: 2,
                                      highlight: true
                                    }
                                  }}
                                  isNested={true}
                                  level={2}
                                >
                                  {/* Individual tokens within this type */}
                                  <CellsContainer>
                                    {tokens.map((token, tokenIndex) => (
                                      <div key={`${typeKey}-token-${tokenIndex}`} 
                                           style={{ 
                                             display: 'flex', 
                                             justifyContent: 'space-between', 
                                             alignItems: 'center',
                                             padding: '12px 16px',
                                             backgroundColor: 'white',
                                             borderRadius: '8px',
                                             marginBottom: tokenIndex < tokens.length - 1 ? '6px' : '0',
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
                                        </div>
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
                                    ))}
                                  </CellsContainer>
                                </CollapsibleMenu>
                              )
                            }).filter(Boolean)
                          })()}
                        </CollapsibleMenu>
                      </div>
                    ))}
                  </div>
                </CollapsibleMenu>
              )}

            </>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltipVisible && (
          <div
            style={{
              position: 'fixed',
              left: tooltipPosition.x - tooltipVisible.length * 3,
              top: tooltipPosition.y - 40,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'pre-line',
              zIndex: 1000,
              maxWidth: '300px',
              wordWrap: 'break-word'
            }}
          >
            {tooltipVisible}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              Loading wallet data...
            </div>
          </div>
        )}
    </div>
  )
}