import React, { useEffect, useRef, useCallback } from 'react';

/**
 * RebalanceItemDialog
 * Glass-style dialog for adding or editing a rebalancing item.
 * Accessible: focus trap, ESC to close, aria labels.
 */
export default function RebalanceItemDialog({
  open,
  editing = false,
  title = editing ? 'Edit Rebalancing Item' : 'Add Rebalancing Item',
  description = 'Define a target allocation using a token, protocol, group or total wallet reference.',
  assetType, setAssetType,
  assetId, setAssetId, assetOptions,
  referenceType, setReferenceType,
  referenceValue, setReferenceValue, referenceOptions,
  note, setNote,
  ASSET_TYPE_OPTIONS,
  RebalanceReferenceType,
  ITEM_TYPES,
  AssetDropdown,
  tokensList,
  protocolsList,
  canAdd,
  isDuplicateCandidate,
  onCancel,
  onSubmit,
  loading = false,
  failedCount = 0,
  timedOutCount = 0,
  theme,
}) {
  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
      if (e.key === 'Tab') {
        // rudimentary focus trap
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const list = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open, onCancel]);

  // Manage focus on open/close
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 0);
    } else if (lastActiveRef.current) {
      try { lastActiveRef.current.focus(); } catch {}
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-card rebalance-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rebalanceDialogTitle"
        aria-describedby="rebalanceDialogDesc"
        ref={dialogRef}
        style={{ maxWidth: 860, width: 'min(96vw,860px)', padding: 24 }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="rebalanceDialogTitle" style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '.5px' }}>{title}</h2>
            <p id="rebalanceDialogDesc" style={{ margin: '6px 0 14px', fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: '1px solid var(--mw-border,var(--app-border))',
              width: 34,
              height: 34,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              lineHeight: 1,
              color: 'var(--mw-text-secondary,var(--app-text-secondary))'
            }}
          >
            ×
          </button>
        </header>

        <div className="rebalance-form-grid" style={{ marginTop: 4 }}>
          {/* Asset Type */}
          <div className="form-group">
            <div className="text-secondary label-sm">Asset Type</div>
            <select
              ref={firstFieldRef}
              value={assetType}
              onChange={(e) => setAssetType(e.target.value === '' ? '' : Number(e.target.value))}
              className="input-base"
            >
              <option value="">Select asset type…</option>
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Asset */}
          <div className="form-group">
            <div className="text-secondary label-sm">Asset</div>
            <AssetDropdown
              theme={theme}
              assetType={assetType}
              value={assetId}
              options={assetOptions}
              onChange={setAssetId}
              tokensList={tokensList}
              placeholder="Select asset…"
            />
          </div>

          {/* Reference Type */}
          <div className="form-group">
            <div className="text-secondary label-sm">Reference Type</div>
            <select
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
              className="input-base"
            >
              <option value="">Select reference type…</option>
              {Object.values(RebalanceReferenceType).map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          {/* Reference Value (conditional) */}
          <div className="form-group">
            <div className="text-secondary label-sm">Reference Value</div>
            {referenceType === RebalanceReferenceType.TotalWallet ? (
              <div className="input-static">—</div>
            ) : referenceType === RebalanceReferenceType.Token ? (
              <AssetDropdown
                theme={theme}
                assetType={ITEM_TYPES.WALLET}
                value={referenceValue}
                options={tokensList}
                onChange={setReferenceValue}
                tokensList={tokensList}
                placeholder="Select value…"
              />
            ) : referenceType === RebalanceReferenceType.Protocol ? (
              <AssetDropdown
                theme={theme}
                assetType="PROTOCOL"
                value={referenceValue}
                options={protocolsList}
                onChange={setReferenceValue}
                placeholder="Select value…"
              />
            ) : (
              <select
                value={referenceValue}
                onChange={(e) => setReferenceValue(e.target.value)}
                className="input-base"
              >
                <option value="">Select value…</option>
                {referenceOptions.map((opt, idx) => (
                  <option key={`${opt.id}-${idx}`} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div className="form-group">
            <div className="text-secondary label-sm">Note</div>
            <select
              value={note}
              onChange={(e) => setNote(Number(e.target.value))}
              className="input-base"
            >
              {Array.from({ length: 101 }, (_, n) => n).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

  <hr style={{ border: 'none', height: 1, background: 'var(--mw-border,var(--app-border))', margin: '20px 0 14px' }} />
        <footer className="dialog-actions" style={{ marginTop: 8 }}>
          <div className={`label-sm ${isDuplicateCandidate ? 'text-secondary' : 'text-transparent'}`} style={{ minHeight: 16 }}>
            {isDuplicateCandidate ? 'This item is already in the list.' : ' '}
          </div>
          <div className="flex gap-8">
            <button type="button" className="btn btn--outline" onClick={onCancel}>Cancel</button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canAdd || isDuplicateCandidate || loading}
              onClick={() => { if (!isDuplicateCandidate && canAdd) onSubmit(); }}
            >
              {loading ? 'Saving…' : (editing ? 'Save' : 'Add')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
