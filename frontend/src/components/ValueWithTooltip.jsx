import React from 'react';

import InfoIconWithTooltip from './InfoIconWithTooltip';

/**
 * ValueWithTooltip
 * Props:
 *  - value: string | number (already formatted display string or raw number)
 *  - tooltip: string (content for tooltip)
 *  - className?: extra classes (e.g., text-success/danger)
 */
export default function ValueWithTooltip({ value, tooltip, className = '' }) {
  return (
    <div className={`flex-end gap-6 ${className}`.trim()} style={{ width: '100%' }}>
      {value}
      <InfoIconWithTooltip content={tooltip} />
    </div>
  );
}
