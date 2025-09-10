import React from 'react'

const DynamicCell = ({ 
  data, 
  columns, 
  onMouseEnter, 
  onMouseLeave, 
  style = {},
  className = '' 
}) => {
  // Calcula o flex total para normalizar os tamanhos
  const totalFlex = Object.values(columns).reduce((sum, col) => sum + (col.flex || 1), 0)
  
  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        ...style
      }}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {Object.entries(columns).map(([key, column], index) => {
        const flexValue = (column.flex || 1) / totalFlex * 100
        const value = typeof column.getValue === 'function' ? column.getValue(data) : data[key]
        
        return (
          <div
            key={key}
            style={{
              flex: `0 0 ${flexValue}%`,
              textAlign: column.align || (index === 0 ? 'left' : 'right'),
              ...column.style
            }}
          >
            {column.label && (
              <div style={{ 
                fontSize: '11px', 
                color: '#6c757d', 
                marginBottom: '2px' 
              }}>
                {column.label}
              </div>
            )}
            <div style={{
              fontFamily: column.monospace ? 'monospace' : 'inherit',
              fontSize: column.fontSize || '14px',
              fontWeight: column.fontWeight || (column.highlight ? '600' : 'normal'),
              color: column.color || (column.highlight ? '#212529' : '#495057')
            }}>
              {value}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Componente especializado para células de token
const TokenCell = ({ 
  token, 
  showRewards = false, 
  showType = false,
  isLast = false,
  onMouseEnter,
  onMouseLeave
}) => {
  const columns = {
    token: {
      flex: 3,
      align: 'left',
      getValue: (data) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {data.logo && (
            <img 
              src={data.logo} 
              alt={data.symbol}
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
          }}>
            {data.symbol}
          </span>
          {showType && data.type && (
            <span style={{
              marginLeft: '8px',
              backgroundColor: data.type === 'supplied' ? '#d4edda' : '#f8d7da',
              color: data.type === 'supplied' ? '#155724' : '#721c24',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {data.type}
            </span>
          )}
        </div>
      )
    }
  }

  if (showRewards) {
    columns.rewards = {
      label: "Rewards",
      flex: 1,
      monospace: true,
      fontSize: '13px',
      fontWeight: '500',
      getValue: (data) => data.rewardValue || '0.00'
    }
  }

  columns.balance = {
    label: "Balance",
    flex: 2,
    monospace: true,
    fontSize: '14px',
    fontWeight: '600',
    highlight: true,
    getValue: (data) => data.formattedPrice || data.totalPrice || '0.00'
  }

  return (
    <DynamicCell
      data={token}
      columns={columns}
      style={{
        marginBottom: isLast ? '0' : '6px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8f9fa'
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        onMouseLeave?.(e)
      }}
    />
  )
}

// Componente para container de células
const CellContainer = ({ 
  children, 
  style = {},
  title,
  subtitle 
}) => (
  <div style={{ 
    backgroundColor: '#f8f9fa', 
    padding: '16px 24px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    ...style
  }}>
    {title && (
      <div style={{ 
        fontWeight: '600', 
        marginBottom: subtitle ? '4px' : '12px', 
        color: '#495057',
        fontSize: '14px'
      }}>
        {title}
      </div>
    )}
    {subtitle && (
      <div style={{ 
        fontSize: '12px', 
        color: '#6c757d',
        marginBottom: '12px'
      }}>
        {subtitle}
      </div>
    )}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      {children}
    </div>
  </div>
)

export { DynamicCell, TokenCell, CellContainer }
export default DynamicCell
