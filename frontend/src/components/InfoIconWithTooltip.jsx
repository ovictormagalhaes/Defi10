import React from 'react';

/**
 * Shared Info icon with click-to-toggle tooltip bubble.
 * Styling relies purely on utility classes (defined in global.css) to avoid inline styles.
 */
export default function InfoIconWithTooltip({
  content,
  align = 'center',
  maxWidth = 180,
  alignPreferred = 'center', // new prop: desired alignment hint
  autoPosition = true,       // enable viewport-aware positioning
  offsetY = 6,
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const bubbleRef = React.useRef(null);
  const [computedAlign, setComputedAlign] = React.useState(align);
  const [inlineStyle, setInlineStyle] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!(e.target instanceof Element)) return setOpen(false);
      if (!e.target.closest('.tooltip-wrapper')) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open || !autoPosition) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    // Determine available space left/right
    const spaceLeft = rect.left;
    const spaceRight = vw - rect.right;
    // Choose alignment trying preferred first
    let final = alignPreferred;
    if (final === 'center') {
      // If near left edge
      if (spaceLeft < 60 && spaceRight > spaceLeft) final = 'right';
      // If near right edge
      if (spaceRight < 60 && spaceLeft > spaceRight) final = 'left';
    } else if (final === 'left') {
      if (spaceLeft < 40 && spaceRight > spaceLeft) final = 'right';
    } else if (final === 'right') {
      if (spaceRight < 40 && spaceLeft > spaceRight) final = 'left';
    }
    setComputedAlign(final);

    // Compute horizontal transform / position for right alignment not previously supported
    // Default center: left 50% translateX(-50%) already handled by class.
    // For left: left:0 translateX(0). For right we emulate symmetrical logic.
    requestAnimationFrame(() => {
      const bubble = bubbleRef.current;
      if (!bubble) return;
      if (final === 'right') {
        bubble.style.left = 'auto';
        bubble.style.right = '0';
        bubble.style.transform = `translate(0, ${offsetY}px)`;
      } else if (final === 'left') {
        bubble.style.left = '0';
        bubble.style.right = 'auto';
        bubble.style.transform = `translate(0, ${offsetY}px)`;
      } else {
        bubble.style.left = '50%';
        bubble.style.right = 'auto';
        bubble.style.transform = `translate(-50%, ${offsetY}px)`;
      }
    });
  }, [open, alignPreferred, autoPosition, offsetY]);

  const bubbleAlignClass = computedAlign === 'left' ? 'tooltip-left' : computedAlign === 'center' ? 'tooltip-center' : 'tooltip-right';

  return (
    <span
      className={`tooltip-wrapper ${open ? 'is-open info-active' : ''}`.trim()}
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
        <div
          className={`tooltip-bubble ${bubbleAlignClass}`.trim()}
          role="tooltip"
          ref={bubbleRef}
          style={inlineStyle}
        >
          {content}
        </div>
      )}
    </span>
  );
}
