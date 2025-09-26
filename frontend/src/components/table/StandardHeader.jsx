import React from 'react';

/**
 * Flexible unified table header.
 * Historical default (legacy): Token | Range | Amount | Rewards | Value
 * New requirement introduces layouts:
 *  - Wallet: Token | Price | Amount | Value
 *  - Lending: Token | Price | Amount | Value
 *  - Liquidity Pool: Token | Range | Amount | Rewards | Value
 * Use `columns` prop (array) to explicitly set which metric columns (after Token) to render, in order.
 * Allowed column keys: 'range', 'price', 'amount', 'rewards', 'value'
 * If `columns` not provided, falls back to legacy behavior with `showRange`.
 */
export default function StandardHeader({
  className = '',
  showRange = true, // Backward compatibility path
  labels = {},
  columns, // simple mode: array of keys
  columnDefs, // advanced mode: [{ key,label,align,className,thProps }]
}) {
  const defaultLabels = {
    token: 'Token',
    range: 'Range',
    price: 'Price',
    amount: 'Amount',
    rewards: 'Rewards',
    value: 'Value',
  };
  const merged = { ...defaultLabels, ...labels };

  // Advanced mode overrides simple sequence if provided
  let sequence = null;
  let advanced = null;
  if (Array.isArray(columnDefs) && columnDefs.length) {
    advanced = columnDefs.map((d) => ({
      key: d.key,
      label: d.label || merged[d.key] || d.key,
      align: d.align || (d.key === 'range' ? 'center' : 'right'),
      className: d.className || `col-${d.key}`,
      thProps: d.thProps || {},
    }));
  } else {
    sequence = columns && Array.isArray(columns) && columns.length ? columns : null;
    if (!sequence) {
      // Legacy fallback
      sequence = [showRange ? 'range' : null, 'amount', 'rewards', 'value'].filter(Boolean);
    }
  }

  return (
    <thead>
      <tr className={`thead-row ${className}`.trim()}>
        <th className="th-head th-left col-name">{merged.token}</th>
        {advanced
          ? advanced.map((col) => (
              <th
                key={col.key}
                className={`th-head ${col.align === 'center' ? 'th-center' : col.align === 'left' ? 'th-left' : 'th-right'} ${col.className}`}
                {...col.thProps}
              >
                {col.label}
              </th>
            ))
          : sequence.map((col) => {
              const label = merged[col] || col;
              const align = col === 'range' ? 'th-center' : 'th-right';
              const baseClass = `th-head ${align} col-${col}`;
              return (
                <th key={col} className={baseClass}>
                  {label}
                </th>
              );
            })}
      </tr>
    </thead>
  );
}
