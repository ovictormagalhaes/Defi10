import React from 'react';

import colors from '../styles/colors';

export default function CellsContainer({ children, style }) {
  const baseStyle = {
    backgroundColor: colors.bgPanelAlt,
    padding: '8px 12px',
    margin: '8px 0',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  };
  return <div style={{ ...baseStyle, ...(style || {}) }}>{children}</div>;
}
