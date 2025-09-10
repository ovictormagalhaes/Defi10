import React, { useEffect, useState } from 'react'

// Componente reutilizável de menu colapsível
function CollapsibleMenu({ 
  title, 
  isExpanded, 
  onToggle, 
  // Nova prop flexível para múltiplas colunas
  columns = {},
  // Props antigas mantidas para compatibilidade (opcionais)
  leftValue, 
  leftLabel,
  middleValue = '', 
  middleLabel = '',
  rightValue, 
  rightLabel,
  children,
  headerActions = null,
  optionsMenu = null,
  isNested = false, // Nova prop para indicar se é um menu aninhado
  level = 0 // Nova prop para indicar o nível hierárquico (0=root, 1=sub, 2=sub-sub, etc.)
}) {
  const [optionsExpanded, setOptionsExpanded] = useState(false)

  // Calcula o tamanho da fonte baseado no level
  const getFontSize = (level) => {
    switch(level) {
      case 0: return '18px' // Root menu - maior
      case 1: return '16px' // Sub menu 
      case 2: return '14px' // Sub-sub menu
      case 3: return '13px' // Sub-sub-sub menu
      default: return '12px' // Níveis mais profundos
    }
  }

  // Calcula o tamanho da fonte para labels baseado no level
  const getLabelFontSize = (level) => {
    switch(level) {
      case 0: return '14px' // Root menu
      case 1: return '13px' // Sub menu 
      case 2: return '12px' // Sub-sub menu
      case 3: return '11px' // Sub-sub-sub menu
      default: return '10px' // Níveis mais profundos
    }
  }

  // Calcula o tamanho da fonte para valores baseado no level
  const getValueFontSize = (level, isHighlighted = false) => {
    const baseSize = {
      0: isHighlighted ? '16px' : '15px', // Root menu
      1: isHighlighted ? '15px' : '14px', // Sub menu 
      2: isHighlighted ? '14px' : '13px', // Sub-sub menu
      3: isHighlighted ? '13px' : '12px', // Sub-sub-sub menu
    }
    return baseSize[level] || (isHighlighted ? '12px' : '11px') // Níveis mais profundos
  }

  // Calcula o padding baseado no level
  const getPadding = (level) => {
    switch(level) {
      case 0: return '12px 20px' // Root menu - padding completo
      case 1: return '10px 16px' // Sub menu - padding reduzido
      case 2: return '8px 12px'  // Sub-sub menu - padding mais reduzido
      case 3: return '6px 10px'  // Sub-sub-sub menu - padding ainda menor
      default: return '4px 8px'  // Níveis mais profundos - padding mínimo
    }
  }

  // Calcula o margin baseado no level
  const getMargin = (level) => {
    switch(level) {
      case 0: return { marginTop: 20, marginBottom: 20 } // Root menu - margin completo
      case 1: return { marginTop: 12, marginBottom: 12 } // Sub menu - margin reduzido
      case 2: return { marginTop: 8, marginBottom: 8 }   // Sub-sub menu - margin mais reduzido
      case 3: return { marginTop: 6, marginBottom: 6 }   // Sub-sub-sub menu - margin ainda menor
      default: return { marginTop: 4, marginBottom: 4 }  // Níveis mais profundos - margin mínimo
    }
  }

  // Processar colunas - prioriza o novo formato, fallback para o antigo
  const processedColumns = () => {
    // Se columns está definido e não é vazio, usa o novo formato
    if (Object.keys(columns).length > 0) {
      return columns
    }
    
    // Fallback para formato antigo
    const oldFormat = {}
    if (leftValue !== undefined || leftLabel) {
      oldFormat.left = { 
        label: leftLabel, 
        value: leftValue, 
        flex: 1 
      }
    }
    if (middleValue !== undefined || middleLabel) {
      oldFormat.middle = { 
        label: middleLabel, 
        value: middleValue, 
        flex: 1 
      }
    }
    if (rightValue !== undefined || rightLabel) {
      oldFormat.right = { 
        label: rightLabel, 
        value: rightValue, 
        flex: 1,
        highlight: true // Último valor geralmente é destacado
      }
    }
    return oldFormat
  }

  const finalColumns = processedColumns()

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsExpanded) {
        setOptionsExpanded(false)
      }
    }

    if (optionsExpanded) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [optionsExpanded])

  return (
    <div style={{ 
      ...getMargin(level),
      marginLeft: isNested ? '0px' : '0',
      paddingLeft: isNested ? '0px' : '0',
      marginRight: isNested ? '0px' : '0',
      paddingRight: isNested ? '0px' : '0'
    }}>
      {/* Collapsible Header */}
      <div 
        style={{ 
          backgroundColor: 'white', 
          padding: getPadding(level), 
          borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
          border: '1px solid #dee2e6',
          borderBottom: isExpanded ? 'none' : '1px solid #dee2e6',
          cursor: 'pointer',
          userSelect: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Título com ícone (lado esquerdo - cresce conforme necessário) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
            <svg 
              style={{ 
                width: '16px', 
                height: '16px', 
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease'
              }} 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path d="M4 6L8 10L12 6" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: 'bold', fontSize: getFontSize(level), color: '#333333' }}>{title}</span>
          </div>

          {/* Container dos valores - flexível baseado no número de colunas */}
          <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
            {Object.entries(finalColumns).map(([key, column], index) => {
              const isHighlighted = column.highlight || false
              const flexValue = column.flex || 1
              
              return (
                <div key={key} style={{ 
                  flex: `${flexValue} 1 0%`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: '0 8px',
                  overflow: 'hidden',
                  minWidth: 0
                }}>
                  {column.label && (
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: isHighlighted ? '#333333' : '#555555', 
                      fontSize: getLabelFontSize(level), 
                      marginBottom: '4px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {column.label}
                    </div>
                  )}
                  {column.value !== undefined && column.value !== null && column.value !== '' && (
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontWeight: isHighlighted ? 'bold' : '600', 
                      fontSize: getValueFontSize(level, isHighlighted), 
                      color: isHighlighted ? '#212529' : '#333333',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {column.value}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Coluna de Opções - largura fixa, sempre presente para manter alinhamento */}
          <div style={{ 
            width: '40px', 
            minWidth: '40px',
            display: 'flex', 
            justifyContent: 'right', 
            alignItems: 'right', 
            position: 'relative' 
          }}>
            {optionsMenu && (
              <>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setOptionsExpanded(!optionsExpanded)
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="5" r="2" fill="#333333"/>
                    <circle cx="12" cy="12" r="2" fill="#333333"/>
                    <circle cx="12" cy="19" r="2" fill="#333333"/>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {optionsExpanded && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      padding: '8px 0',
                      minWidth: '200px',
                      zIndex: 1000
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {optionsMenu}
                  </div>
                )}
              </>
            )}
            {/* Espaço vazio quando não há optionsMenu, mantém o layout consistente */}
          </div>
        </div>
      </div>
      
      {/* Header Actions (como configurações) */}
      {isExpanded && headerActions && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: getPadding(level), 
          borderLeft: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6',
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center' 
        }}>
          {headerActions}
        </div>
      )}
      
      {/* Collapsible Content */}
      {isExpanded && (
        <div style={{
          paddingLeft: isNested ? `${4 + (level * 4)}px` : '0',
          paddingRight: isNested ? `${4 + (level * 4)}px` : '0'
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default CollapsibleMenu
