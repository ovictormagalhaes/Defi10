import React, { ReactNode } from 'react';

import InfoIconWithTooltip from './InfoIconWithTooltip';

/**
 * ValueWithTooltip
 * Props:
 *  - value: ReactNode (string | number | JSX)
 *  - tooltip: ReactNode (content for tooltip)
 *  - className?: extra classes (e.g., text-success/danger)
 */
export interface ValueWithTooltipProps {
  value: ReactNode;
  tooltip: ReactNode;
  className?: string;
  infoAlign?: 'center' | 'left'; // legacy simple align
  infoMaxWidth?: number;
  alignPreferred?: 'left' | 'center' | 'right'; // new: viewport-aware preference
  autoPosition?: boolean;
}

export default function ValueWithTooltip({
  value,
  tooltip,
  className = '',
  infoAlign = 'center',
  infoMaxWidth = 180,
  alignPreferred = 'center',
  autoPosition = true,
}: ValueWithTooltipProps) {
  return (
    <div className={`flex-end gap-6 ${className}`.trim()} style={{ width: '100%' }}>
      {value}
      <InfoIconWithTooltip content={tooltip} align={infoAlign} maxWidth={infoMaxWidth} />
    </div>
  );
}
