import React from 'react';

export type PanelVariant =
  | 'default'
  | 'alt'
  | 'success'
  | 'error'
  | 'neutral-light'
  | 'neutral-lighter';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  noPadding?: boolean;
}

const variantClass: Record<PanelVariant, string> = {
  default: 'panel',
  alt: 'panel panel--alt',
  success: 'panel panel--success',
  error: 'panel panel--error',
  'neutral-light': 'panel panel--neutral-light',
  'neutral-lighter': 'panel panel--neutral-lighter',
};

export const Panel: React.FC<PanelProps> = ({
  variant = 'default',
  noPadding,
  className = '',
  children,
  ...rest
}) => {
  const base = variantClass[variant] || variantClass.default;
  const composed = `${base}${noPadding ? ' p-0' : ''}${className ? ' ' + className : ''}`;
  return (
    <div className={composed} {...rest}>
      {children}
    </div>
  );
};

export default Panel;
