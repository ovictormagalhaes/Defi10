import React, { useEffect, useRef, useState, ReactNode } from 'react';

/**
 * Shared Info icon with click-to-toggle tooltip bubble.
 * Styling relies purely on utility classes (defined in global.css) to avoid inline styles.
 */
export interface InfoIconWithTooltipProps {
  content: ReactNode;
  align?: 'center' | 'left';
  maxWidth?: number; // in px, applied via data attribute for CSS targeting if needed
}

export default function InfoIconWithTooltip({
  content,
  align = 'center',
  maxWidth = 180,
}: InfoIconWithTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as Element | null;
      if (!target) return setOpen(false);
      if (!target.closest('.tooltip-wrapper')) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const bubbleAlignClass = align === 'left' ? 'tooltip-left' : 'tooltip-center';

  return (
    <span
      className={`tooltip-wrapper ${open ? 'is-open' : ''}`.trim()}
      ref={ref}
      data-max-width={maxWidth}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((o) => !o);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
            setOpen((o) => !o);
        }
        if (e.key === 'Escape') setOpen(false);
      }}
      aria-expanded={open}
    >
      <svg
        className="info-icon"
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {open && (
        <div className={`tooltip-bubble ${bubbleAlignClass}`.trim()} role="tooltip">
          {content}
        </div>
      )}
    </span>
  );
}
