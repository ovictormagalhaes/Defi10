import React from 'react';

export type StatusKind = 'healthy' | 'unhealthy' | 'loading';

interface StatusBadgeProps {
  status: StatusKind;
  label?: string;
  className?: string;
}

const LABELS: Record<StatusKind, string> = {
  healthy: 'Healthy',
  unhealthy: 'Unhealthy',
  loading: 'Loading',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const base = 'status-badge';
  const variant = `status-badge--${status}`;
  return (
    <span className={`${base} ${variant}${className ? ' ' + className : ''}`}>
      {label || LABELS[status]}
    </span>
  );
};

export default StatusBadge;
