import React from 'react';

import StandardHeader from './StandardHeader';

/**
 * Wrapper for unified table styling. Provides consistent <table> element and optional header.
 * Props:
 *  - children: rows (<tbody> content)
 *  - withHeader: bool (default true)
 *  - headerClassName: extra classes for header row
 *  - tableClassName: extra classes for table element
 */
export default function UnifiedTable({
  children,
  withHeader = true,
  headerClassName = '',
  tableClassName = '',
}) {
  return (
    <table className={`table-unified text-primary ${tableClassName}`.trim()}>
      {withHeader && <StandardHeader className={headerClassName} />}
      {children}
    </table>
  );
}
