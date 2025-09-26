import * as React from 'react';

export interface InfoIconWithTooltipProps {
  content: React.ReactNode;
  align?: 'center' | 'left';
  maxWidth?: number;
  alignPreferred?: 'left' | 'center' | 'right';
  autoPosition?: boolean;
  offsetY?: number;
}

export default function InfoIconWithTooltip(props: InfoIconWithTooltipProps): JSX.Element;