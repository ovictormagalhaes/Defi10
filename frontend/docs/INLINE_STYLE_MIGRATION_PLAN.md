# Inline Style Migration Plan

Goal: Remove (or reduce to near-zero) usage of forbidden inline `style` props in favor of utility classes / theme tokens for consistency, caching, and easier future theming.

## Phases

### Phase 1 – Inventory & Baseline (DONE partially)
- Collected lint output: primary offenders are large table / summary components (`RebalancingView.jsx`, `SectionTable.jsx`, `ProtocolTables.jsx`, `SummaryView.jsx`, etc.).
- Establish metrics baseline: ~590 `react/forbid-dom-props` warnings.

### Phase 2 – Core Primitives & Utilities (ALREADY IN PLACE)
- `global.css` provides spacing, layout, typography, panel, badge, table wrappers.
- Add missing utility gaps:
  - Table cell padding variants (e.g., `.px-4`, `.py-2`, `.p-2`, `.p-3` already? verify and extend if needed)
  - Text alignment (`.text-right`, `.text-left`, `.text-center`).
  - Monospace + numeric (`.font-mono`, `.tabular-nums`).
  - Color tokens mapping classes (if not present) like `.text-secondary`, `.text-muted`, `.bg-panel-alt`.

### Phase 3 – High-Volume Table Components (PRIORITY)
Target order (descending warning density / user visibility):
1. `RebalancingView.jsx`
2. `SectionTable.jsx`
3. `ProtocolTables.jsx`
4. `LendingTables.jsx`
5. `PoolTables.jsx`
6. `WalletTokensTable.jsx` & `TokensMenu.jsx`
7. `SummaryView.jsx`

Approach per component:
- Extract repeated style objects (row hover, striped backgrounds, padding rules) into semantic utility classes: e.g., `.table-row`, `.table-row--hoverable`, `.table-cell--numeric`.
- Replace inline numeric formatting font families with `.font-mono`.
- Map background colors using CSS variables (e.g., `var(--color-table-header-bg)`). Where dynamic (striping/hover) derive them once and apply data attributes or conditional class toggles.

### Phase 4 – Shared Class Extraction
After 2–3 components migrated:
- Consolidate any ad-hoc new classes into `global.css` under a `/* Tables */` section.
- Remove now-unused JS constants that only provided style objects.

### Phase 5 – Minor Components & Clean-Up
- Smaller components (`Chip.jsx`, `ActionButton.tsx`, `DynamicCell.jsx`) – strip remaining inline spacing / layout.
- Ensure theming still controlled via CSS variables (avoid hard-coded hex values in JSX).

### Phase 6 – Enforcement Tightening
- Once warning count < 50:
  - Elevate `react/forbid-dom-props` to `error` to prevent regression.
  - Optionally add a custom ESLint rule override allowing a whitelisted set (e.g., temporary dynamic width cases) with inline `// eslint-disable-next-line` justification.

## Utility Class Additions (Proposed)
| Need | Class | Declaration |
|------|-------|-------------|
| Monospace numeric | `.font-mono` | `font-family: ui-monospace, SFMono-Regular, Menlo, monospace;` |
| Right align | `.text-right` | `text-align: right;` |
| Small uppercase header | `.text-xs-up` | `font-size: 12px; letter-spacing: .04em; font-weight: 500; text-transform: uppercase;` |
| Table cell padding | `.cell-sm` | `padding: 8px 12px;` |
| Table cell padding md | `.cell-md` | `padding: 12px 16px;` |
| Table cell padding lg | `.cell-lg` | `padding: 16px 20px;` |
| Hover row | `.row-hover:hover` | `background: var(--color-table-row-hover-bg);` |
| Striped alt | `.row-alt` | `background: var(--color-table-row-alt-bg);` |
| Muted text | `.text-muted` | `color: var(--color-text-secondary);` |
| Primary text | `.text-primary` | `color: var(--color-text-primary);` |
| Truncate | `.truncate` | `overflow:hidden; text-overflow:ellipsis; white-space:nowrap;` |

## Dynamic Background / Hover Strategy
Instead of inline `onMouseEnter` / `onMouseLeave` mutating style:
1. Assign base classes: `className={clsx('table-row', isStriped && 'row-alt')}`.
2. Provide a single `.table-row` rule with transition and cursor.
3. Use `.table-row:hover` for hover color.
4. Colors resolved through CSS variables set by theme layer.

Add variables to theme CSS var application (if missing):
- `--color-table-header-bg`
- `--color-table-row-alt-bg`
- `--color-table-row-hover-bg`

## Incremental Migration Example (Token Row)
Before:
```
<tr style={{ backgroundColor: isStriped ? stripeBg : 'transparent' }} ...>
  <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily:'monospace' }}>
```
After:
```
<tr className={clsx('table-row', isStriped && 'row-alt')}>
  <td className="cell-lg text-right font-mono">
```
Hover and stripe handled purely by CSS.

## Measurement & Tracking
- Add an npm script `lint:styles` that runs ESLint filtered to the rule and counts warnings: `eslint src --rule 'react/forbid-dom-props: [1]' -f json | jq` (optional for non-Windows shells; for Windows PowerShell adapt with `Select-String`).
- Maintain a running count in PR descriptions as components migrate.

## Risks / Edge Cases
- Some inline styles may be conditional with computed numeric widths; convert those to style attributes only when unavoidable or refactor to CSS variables injected via `style` on a parent container (allowed exception if documented).
- Performance: Large tables—ensure class-based hover doesn’t introduce layout thrash (it won’t vs inline event mutations).

## Acceptance Criteria
- All major table/summary components free of repetitive padding/color/typography inline styles.
- < 50 remaining inline style warnings.
- Theme switching continues to work (verify background + text colors adapt).
- No regression in layout density or alignment.

## Follow-Up Enhancements
- Introduce a design token extraction for spacing scales (`--space-2`, `--space-3`, etc.).
- Consider a lightweight utility framework generation script to avoid manual class additions.
- Optionally migrate to CSS Modules or Tailwind in a subsequent refactor (out of scope now).
