import React from 'react';

import { config } from '../config/api';
import { useTheme } from '../context/ThemeProvider';
// import { getFontStyles } from '../styles/fontStyles'; // (Unused after refactor)
import { ITEM_TYPES } from '../utils/walletUtils';

import TokenDisplay from './TokenDisplay';
import ValueWithTooltip from './ValueWithTooltip';
import { formatPercent, formatUsd } from '../utils/formatting';
import IconButton from './IconButton';
import StandardHeader from './table/StandardHeader';
import Skeleton from './Skeleton';
import CollapsibleMenu from './CollapsibleMenu';
import RebalanceItemDialog from './RebalanceItemDialog';

// Frontend mirror of backend enum
const RebalanceReferenceType = {
  Token: 'Token',
  Protocol: 'Protocol',
  Group: 'Group',
  TotalWallet: 'TotalWallet',
};

// Unified control height for selects and dropdowns
const CONTROL_HEIGHT = 38;

const ASSET_TYPE_OPTIONS = [
  { value: ITEM_TYPES.WALLET, label: 'Wallet' },
  { value: ITEM_TYPES.LIQUIDITY_POOL, label: 'Liquidity Pools' },
  { value: ITEM_TYPES.LENDING_AND_BORROWING, label: 'Lending & Borrowing' },
  { value: ITEM_TYPES.STAKING, label: 'Staking' },
];

const GROUP_OPTIONS = [
  { value: ITEM_TYPES.WALLET, label: 'Wallet' },
  { value: ITEM_TYPES.LIQUIDITY_POOL, label: 'Liquidity Pools' },
  { value: ITEM_TYPES.LENDING_AND_BORROWING, label: 'Lending & Borrowing' },
  { value: ITEM_TYPES.STAKING, label: 'Staking' },
];

export default function RebalancingView({
  walletTokens = [],
  getLiquidityPoolsData,
  getLendingAndBorrowingData,
  getStakingData,
  theme: themeProp,
  account,
  initialSavedKey,
  initialSavedCount,
  initialSavedItems,
}) {
  // Theme (allow override via prop, else context)
  const { theme: themeCtx } = useTheme();
  const theme = themeProp || themeCtx;

  // Normalize chain identifier for token grouping / id composition
  const getChainKey = React.useCallback((tok) => {
    if (!tok || typeof tok !== 'object') return 'unknown';
    const raw = tok.chain || tok.chainId || tok.chainID || tok.network || tok.chainName || tok.chain_name;
    if (raw == null) return 'unknown';
    const lower = String(raw).trim().toLowerCase();
    const norm = {
      '1': 'eth',
      eth: 'eth',
      ethereum: 'eth',
      mainnet: 'eth',
      erc20: 'eth',

      '137': 'polygon',
      polygon: 'polygon',
      matic: 'polygon',

      avalanche: 'avalanche',
      '43114': 'avalanche',
      avax: 'avalanche',

      '10': 'optimism',
      optimism: 'optimism',
      op: 'optimism',

      '56': 'bsc',
      bsc: 'bsc',
      bnb: 'bsc',
      binance: 'bsc',
      'binance smart chain': 'bsc',
      'bnb smart chain': 'bsc',

      '250': 'fantom',
      fantom: 'fantom',
      ftm: 'fantom',

      base: 'base',
      '84531': 'base',
    };
    return norm[lower] || lower;
  }, []);

  // Prepare candidate lists
  const tokensList = React.useMemo(() => {
    return (walletTokens || []).map((t, i) => {
      const tok = t.token || t;
      const baseId = tok.contractAddress || tok.tokenAddress || tok.symbol || tok.name || 'token';
      const chainKey = getChainKey(tok);
      const id = `${baseId}#${chainKey || i}`;
      const label = tok.symbol || tok.name || baseId;
      return { id, label, raw: tok };
    });
  }, [walletTokens, getChainKey]);

  // Simple loading heuristic: if no tokens yet but account exists, show skeleton placeholders
  const isLoadingPrimary = (!walletTokens || walletTokens.length === 0) && !!account;
  const skeletonRows = React.useMemo(() => Array.from({ length: 4 }), []);

  const poolsList = React.useMemo(() => {
    const arr = getLiquidityPoolsData?.() || [];
    return arr.map((item, i) => {
      const pos = item.position || item;
      let label = pos?.name || item?.name;
      if (!label && Array.isArray(pos?.tokens)) {
        const syms = pos.tokens.map((x) => x?.symbol || x?.name).filter(Boolean);
        if (syms.length >= 2) label = `${syms[0]}/${syms[1]}`;
      }
      const baseId = pos?.id || item?.id || label || `pool-${i}`;
      const id = `${String(baseId)}#${i}`;
      return { id, label: label || String(baseId), raw: item };
    });
  }, [getLiquidityPoolsData]);

  const lendingList = React.useMemo(() => {
    const arr = getLendingAndBorrowingData?.() || [];
    return arr.map((item, i) => {
      const pos = item.position || item;
      const baseId = pos?.id || item?.id || `lend-${i}`;
      const id = `${String(baseId)}#${i}`;
      let label = pos?.name || item?.name;
      if (!label) {
        const toks = Array.isArray(pos?.tokens) ? pos.tokens : [];
        const norm = (x) => (x && x.token ? x.token : x);
        const supplied = toks
          .filter((t) => {
            const ty = (t?.type || '').toString().toLowerCase();
            return ty === 'supplied' || ty === 'supply' || ty === 'deposit' || ty === 'collateral';
          })
          .map(norm);
        const choose = supplied.length ? supplied : toks.map(norm);
        const syms = choose.map((t) => t?.symbol || t?.name).filter(Boolean);
        if (syms.length >= 2) label = `${syms[0]}/${syms[1]}`;
        else if (syms.length === 1) label = syms[0];
      }
      if (!label) label = `Lending #${i + 1}`;
      return { id, label, raw: item };
    });
  }, [getLendingAndBorrowingData]);

  const stakingList = React.useMemo(() => {
    const arr = getStakingData?.() || [];
    return arr.map((item, i) => {
      const pos = item.position || item;
      const baseId = pos?.id || item?.id || `stake-${i}`;
      const id = `${String(baseId)}#${i}`;
      const label = pos?.name || item?.name || `Staking #${i + 1}`;
      return { id, label, raw: item };
    });
  }, [getStakingData]);

  // (Tooltip logic moved to shared InfoIconWithTooltip component used by ValueWithTooltip)

  const allDefi = React.useMemo(() => {
    return [
      ...(getLiquidityPoolsData?.() || []),
      ...(getLendingAndBorrowingData?.() || []),
      ...(getStakingData?.() || []),
    ];
  }, [getLiquidityPoolsData, getLendingAndBorrowingData, getStakingData]);

  const protocolsList = React.useMemo(() => {
    const set = new Map();
    const getLogoFromAny = (t) => {
      if (!t || typeof t !== 'object') return '';
      return (
        t.logo ||
        t.logoURI ||
        t.image ||
        t.icon ||
        t.logoUrl ||
        t.logo_url ||
        t.iconUrl ||
        t.icon_url ||
        ''
      );
    };
    allDefi.forEach((it, idx) => {
      const p = it.protocol || it.provider || it.platform || it?.position?.protocol;
      const name =
        (typeof p === 'string' ? p : p?.name) || it?.protocolName || it?.position?.protocolName;
      if (!name) return;
      if (!set.has(name)) {
        // Try to find a logo from various shapes
        let logo = '';
        if (typeof p === 'object') logo = getLogoFromAny(p);
        if (!logo && it) logo = getLogoFromAny(it);
        if (!logo && it?.position) logo = getLogoFromAny(it.position);
        if (!logo && it?.position?.protocol) logo = getLogoFromAny(it.position.protocol);
        set.set(name, { id: name, label: name, raw: { logo } });
      }
    });
    return Array.from(set.values());
  }, [allDefi]);

  // Form state
  // Start all selects unselected (placeholder)
  const [assetType, setAssetType] = React.useState('');
  const [assetId, setAssetId] = React.useState('');
  const [referenceType, setReferenceType] = React.useState('');
  const [referenceValue, setReferenceValue] = React.useState('');
  const [note, setNote] = React.useState(0);
  const [entries, setEntries] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [saveResult, setSaveResult] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  // Options based on selections
  const assetOptions = React.useMemo(() => {
    switch (assetType) {
      case ITEM_TYPES.WALLET:
        return tokensList;
      case ITEM_TYPES.LIQUIDITY_POOL:
        return poolsList;
      case ITEM_TYPES.LENDING_AND_BORROWING:
        return lendingList;
      case ITEM_TYPES.STAKING:
        return stakingList;
      default:
        return [];
    }
  }, [assetType, tokensList, poolsList, lendingList, stakingList]);

  const referenceOptions = React.useMemo(() => {
    switch (referenceType) {
      case RebalanceReferenceType.Token:
        return tokensList;
      case RebalanceReferenceType.Protocol:
        return protocolsList;
      case RebalanceReferenceType.Group:
        return GROUP_OPTIONS.map((g) => ({ id: String(g.value), label: g.label }));
      case RebalanceReferenceType.TotalWallet:
        return [];
      default:
        return [];
    }
  }, [referenceType, tokensList, protocolsList]);

  // Reset dependent fields on changes
  React.useEffect(() => {
    if (!editingId) setAssetId('');
  }, [assetType, editingId]);
  React.useEffect(() => {
    if (!editingId) setReferenceValue('');
  }, [referenceType, editingId]);

  const canAdd =
    assetType !== '' &&
    assetId &&
    referenceType !== '' &&
    (referenceType === RebalanceReferenceType.TotalWallet || referenceValue);

  const handleAdd = () => {
    if (!canAdd) return;
    const atLabel =
      ASSET_TYPE_OPTIONS.find((a) => a.value === assetType)?.label || String(assetType);
    const assetLabel = assetOptions.find((a) => a.id === assetId)?.label || assetId;
    const refLabel =
      referenceType === RebalanceReferenceType.TotalWallet
        ? 'Total Wallet'
        : referenceOptions.find((r) => r.id === referenceValue)?.label || referenceValue;
    const newId = `${assetType}-${assetId}-${referenceType}-${referenceValue || 'total'}`;
    setEntries((prev) => {
      if (prev.some((e) => e.id === newId)) return prev; // prevent duplicates
      return [
        ...prev,
        {
          id: newId,
          assetType,
          assetId,
          assetLabel,
          referenceType,
          referenceValue: referenceValue || null,
          referenceLabel: refLabel,
          note: Number(note) || 0,
        },
      ];
    });
  };

  const handleSubmit = () => {
    if (!canAdd) return;
    const refLabel =
      referenceType === RebalanceReferenceType.TotalWallet
        ? 'Total Wallet'
        : referenceOptions.find((r) => r.id === referenceValue)?.label || referenceValue;
    const assetLabel = assetOptions.find((a) => a.id === assetId)?.label || assetId;
    const newId = `${assetType}-${assetId}-${referenceType}-${referenceValue || 'total'}`;
    if (editingId) {
      // Update existing
      const dup = entries.some((e) => e.id === newId && e.id !== editingId);
      if (dup) return;
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? {
                ...e,
                id: newId,
                assetType,
                assetId,
                assetLabel,
                referenceType,
                referenceValue: referenceValue || null,
                referenceLabel: refLabel,
                note: Number(note) || 0,
              }
            : e
        )
      );
      setEditingId(null);
    } else {
      handleAdd();
    }
    setShowDialog(false);
  };

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  // Helpers reused for icon rendering in entries list
  const getLogoFromAnyTop = React.useCallback((t) => {
    if (!t || typeof t !== 'object') return '';
    return (
      t.logo ||
      t.logoURI ||
      t.image ||
      t.icon ||
      t.logoUrl ||
      t.logo_url ||
      t.iconUrl ||
      t.icon_url ||
      ''
    );
  }, []);
  // No token logo fallbacks: rely only on provided logo fields

  const inputBase = {
    background: theme.bgPanel,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    width: '100%',
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
  };

  // --- Current value and percentage computations ---
  const getPositionTokens = React.useCallback((pos) => {
    if (!pos || typeof pos !== 'object') return [];
    if (Array.isArray(pos.tokens) && pos.tokens.length) return pos.tokens;
    if (Array.isArray(pos.pool?.tokens) && pos.pool.tokens.length) return pos.pool.tokens;
    const t0 = pos.token0 || pos.tokenA || pos.baseToken || pos.primaryToken;
    const t1 = pos.token1 || pos.tokenB || pos.quoteToken || pos.secondaryToken;
    const arr = [];
    if (t0) arr.push(t0);
    if (t1) arr.push(t1);
    return arr;
  }, []);

  const toNumber = (v) => {
    const n = Number(v);
    return isFinite(n) ? n : 0;
  };

  const tokenTotalPrice = React.useCallback((tok) => {
    if (!tok || typeof tok !== 'object') return 0;
    const raw = tok.token || tok;
    const direct = raw.totalPrice ?? raw.financials?.totalPrice;
    return toNumber(direct);
  }, []);

  const signedTokenValue = React.useCallback(
    (tok, pos) => {
      // Borrowed/debt negative, others positive (best-effort)
      const t = ((tok?.type || tok?.label || '') + '').toLowerCase();
      const val = Math.abs(tokenTotalPrice(tok));
      if (t.includes('borrow') || t.includes('debt')) return -val;
      if (!t) {
        const lbl = ((pos?.position?.label || pos?.label || '') + '').toLowerCase();
        if (lbl.includes('borrow') || lbl.includes('debt')) return -val;
      }
      return val;
    },
    [tokenTotalPrice]
  );

  const entryCurrentValues = React.useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      let cur = 0;
      if (e.assetType === ITEM_TYPES.WALLET) {
        const tok = tokensList.find((o) => o.id === e.assetId)?.raw;
        cur = tokenTotalPrice(tok);
      } else if (e.assetType === ITEM_TYPES.LIQUIDITY_POOL) {
        const raw = poolsList.find((o) => o.id === e.assetId)?.raw;
        const pos = raw?.position || raw;
        const toks = getPositionTokens(pos).map((x) => (x && x.token ? x.token : x));
        if (toks.length) cur = toks.reduce((s, t) => s + tokenTotalPrice(t), 0);
        else cur = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
      } else if (e.assetType === ITEM_TYPES.LENDING_AND_BORROWING) {
        const raw = lendingList.find((o) => o.id === e.assetId)?.raw;
        const pos = raw?.position || raw;
        const toks = Array.isArray(pos?.tokens) ? pos.tokens : [];
        if (toks.length) cur = toks.reduce((s, t) => s + signedTokenValue(t, pos), 0);
        else cur = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
      } else if (e.assetType === ITEM_TYPES.STAKING) {
        const raw = stakingList.find((o) => o.id === e.assetId)?.raw;
        const pos = raw?.position || raw;
        // Prefer explicit totalPrice/value; else sum tokens; else use balance (already USD?)
        const explicit = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
        if (explicit) cur = explicit;
        else {
          const toks = getPositionTokens(pos).map((x) => (x && x.token ? x.token : x));
          if (toks.length) cur = toks.reduce((s, t) => s + tokenTotalPrice(t), 0);
          else cur = toNumber(pos?.balance);
        }
      }
      map.set(e.id, cur);
    });
    return map;
  }, [
    entries,
    tokensList,
    poolsList,
    lendingList,
    stakingList,
    getPositionTokens,
    tokenTotalPrice,
    signedTokenValue,
  ]);

  // Total portfolio current value (Wallet + Liquidity + Lending net + Staking)
  const totalPortfolioCurrent = React.useMemo(() => {
    // Wallet tokens
    const walletSum = tokensList.reduce((s, o) => s + tokenTotalPrice(o.raw), 0);
    // Liquidity pools
    const poolsSum = poolsList.reduce((s, o) => {
      const pos = o.raw?.position || o.raw;
      const toks = getPositionTokens(pos).map((x) => (x && x.token ? x.token : x));
      if (toks.length) return s + toks.reduce((ss, t) => ss + tokenTotalPrice(t), 0);
      const explicit = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
      return s + explicit;
    }, 0);
    // Lending (signed)
    const lendingSum = lendingList.reduce((s, o) => {
      const pos = o.raw?.position || o.raw;
      const toks = Array.isArray(pos?.tokens) ? pos.tokens : [];
      if (toks.length) return s + toks.reduce((ss, t) => ss + signedTokenValue(t, pos), 0);
      const explicit = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
      return s + explicit;
    }, 0);
    // Staking
    const stakingSum = stakingList.reduce((s, o) => {
      const pos = o.raw?.position || o.raw;
      const explicit = toNumber(pos?.totalPrice ?? pos?.value ?? pos?.financials?.totalPrice);
      if (explicit) return s + explicit;
      const toks = getPositionTokens(pos).map((x) => (x && x.token ? x.token : x));
      if (toks.length) return s + toks.reduce((ss, t) => ss + tokenTotalPrice(t), 0);
      return s + toNumber(pos?.balance);
    }, 0);
    return walletSum + poolsSum + lendingSum + stakingSum;
  }, [
    tokensList,
    poolsList,
    lendingList,
    stakingList,
    getPositionTokens,
    tokenTotalPrice,
    signedTokenValue,
  ]);

  const bucketKey = (e) => `${e.referenceType}:${e.referenceValue ?? 'total'}`;

  const bucketNoteSums = React.useMemo(() => {
    const m = new Map();
    entries.forEach((e) => {
      const k = bucketKey(e);
      m.set(k, (m.get(k) || 0) + (Number(e.note) || 0));
    });
    return m;
  }, [entries]);

  const bucketCurrentSums = React.useMemo(() => {
    const m = new Map();
    entries.forEach((e) => {
      const k = bucketKey(e);
      const v = entryCurrentValues.get(e.id) || 0;
      m.set(k, (m.get(k) || 0) + v);
    });
    // For TotalWallet bucket, use the entire portfolio current value
    const hasTotalWallet = entries.some(
      (e) => e.referenceType === RebalanceReferenceType.TotalWallet
    );
    if (hasTotalWallet) {
      m.set(`${RebalanceReferenceType.TotalWallet}:total`, totalPortfolioCurrent);
    }
    return m;
  }, [entries, entryCurrentValues, totalPortfolioCurrent]);

  // Prefill entries from backend-saved items
  React.useEffect(() => {
    if (!Array.isArray(initialSavedItems) || initialSavedItems.length === 0) return;
    // Build a lookup for labels
    const tokenById = new Map(tokensList.map((t) => [t.id, t]));
    const poolById = new Map(poolsList.map((p) => [p.id, p]));
    const lendById = new Map(lendingList.map((l) => [l.id, l]));
    const stakeById = new Map(stakingList.map((s) => [s.id, s]));
    const protoById = new Map(protocolsList.map((p) => [p.id, p]));

    const mapRefType = (n) => {
      if (n === 0) return RebalanceReferenceType.Token;
      if (n === 1) return RebalanceReferenceType.Protocol;
      if (n === 2) return RebalanceReferenceType.Group;
      if (n === 3) return RebalanceReferenceType.TotalWallet;
      return RebalanceReferenceType.Protocol;
    };

    const makeAssetLabel = (assetId, type) => {
      const src =
        type === ITEM_TYPES.WALLET
          ? tokenById
          : type === ITEM_TYPES.LIQUIDITY_POOL
            ? poolById
            : type === ITEM_TYPES.LENDING_AND_BORROWING
              ? lendById
              : type === ITEM_TYPES.STAKING
                ? stakeById
                : null;
      return src?.get(assetId)?.label || assetId;
    };

    const makeRefLabel = (refType, val) => {
      if (refType === RebalanceReferenceType.TotalWallet) return 'Total Wallet';
      if (refType === RebalanceReferenceType.Group) {
        const g = GROUP_OPTIONS.find((g) => String(g.value) === String(val));
        return g?.label || String(val);
      }
      if (refType === RebalanceReferenceType.Token) return tokenById.get(val)?.label || String(val);
      if (refType === RebalanceReferenceType.Protocol)
        return protoById.get(val)?.label || String(val);
      return String(val);
    };

    const mapped = initialSavedItems.map((it) => {
      const refType = mapRefType(it.byGroupType);
      const entry = {
        id: `${it.type}-${it.asset}-${refType}-${refType === RebalanceReferenceType.TotalWallet ? 'total' : it.value || ''}`,
        assetType: it.type,
        assetId: it.asset,
        assetLabel: makeAssetLabel(it.asset, it.type),
        referenceType: refType,
        referenceValue: it.value,
        referenceLabel: makeRefLabel(refType, it.value),
        note: it.note ?? 0,
      };
      return entry;
    });
    // Deduplicate with existing entries and set
    setEntries((prev) => {
      const byId = new Map(prev.map((e) => [e.id, e]));
      mapped.forEach((m) => {
        if (!byId.has(m.id)) byId.set(m.id, m);
      });
      return Array.from(byId.values());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSavedItems, tokensList, poolsList, lendingList, stakingList, protocolsList]);

  // Duplicate detection for current selection (used to disable Add in dialog)
  const candidateId =
    assetType !== '' && assetId && referenceType !== ''
      ? `${assetType}-${assetId}-${referenceType}-${referenceType === RebalanceReferenceType.TotalWallet ? 'total' : referenceValue || ''}`
      : '';
  const isDuplicateCandidate = candidateId
    ? entries.some((e) => e.id === candidateId && e.id !== editingId)
    : false;

  // Map reference type to backend enum numeric values (Token=0, Protocol=1, Group=2, TotalWallet=3)
  const REF_ENUM_MAP = {
    [RebalanceReferenceType.Token]: 0,
    [RebalanceReferenceType.Protocol]: 1,
    [RebalanceReferenceType.Group]: 2,
    [RebalanceReferenceType.TotalWallet]: 3,
  };

  return (
    <div className="panel rebalance-panel pad-16 text-primary">
      <div className="panel-header">
        <div className="flex-center gap-10">
          <div className="panel-title">Rebalancing</div>
          {initialSavedKey && (
            <div className="badge badge-secondary badge-sm" title={`key: ${initialSavedKey}`}>
              last saved • items: {initialSavedCount ?? 0}
            </div>
          )}
        </div>
        <button type="button" onClick={() => setShowDialog(true)} className="btn btn--outline">
          Add
        </button>
      </div>

      {/* Rebalance Item Dialog (glass UI) */}
      <RebalanceItemDialog
        open={showDialog}
        editing={!!editingId}
        assetType={assetType}
        setAssetType={setAssetType}
        assetId={assetId}
        setAssetId={setAssetId}
        assetOptions={assetOptions}
        referenceType={referenceType}
        setReferenceType={setReferenceType}
        referenceValue={referenceValue}
        setReferenceValue={setReferenceValue}
        referenceOptions={referenceOptions}
        note={note}
        setNote={setNote}
        ASSET_TYPE_OPTIONS={ASSET_TYPE_OPTIONS}
        RebalanceReferenceType={RebalanceReferenceType}
        ITEM_TYPES={ITEM_TYPES}
        AssetDropdown={AssetDropdown}
        tokensList={tokensList}
        protocolsList={protocolsList}
        canAdd={canAdd}
        isDuplicateCandidate={isDuplicateCandidate}
        onCancel={() => { setShowDialog(false); if (editingId) setEditingId(null); }}
        onSubmit={handleSubmit}
        theme={theme}
      />

      {/* Entries List (Grouped Collapsible Sections) */}
      {entries.length > 0 && (
        <div className="mt-20 flex column gap-20">
          {[
            { type: ITEM_TYPES.WALLET, label: 'Wallet' },
            { type: ITEM_TYPES.LIQUIDITY_POOL, label: 'Liquidity Pools' },
            { type: ITEM_TYPES.LENDING_AND_BORROWING, label: 'Lending & Borrowing' },
            { type: ITEM_TYPES.STAKING, label: 'Staking' },
          ].map(group => {
            const groupEntries = entries.filter(e => e.assetType === group.type);
            if (!groupEntries.length && !isLoadingPrimary) return null;
            return (
              <CollapsibleMenu
                key={group.type}
                title={group.label}
                variant="flat"
                showSummary={false}
              >
                <table className="table-unified text-primary">
                  <StandardHeader
                    columnDefs={[
                      // Icon + name are merged in the first (token) column; remaining metric/action columns follow
                      { key: 'current', label: '% Current', align: 'right' },
                      { key: 'target', label: '% Target', align: 'right' },
                      { key: 'diff', label: '% Diff', align: 'right' },
                      { key: 'note', label: 'Note', align: 'left' },
                      { key: 'actions', label: '', align: 'right', className: 'col-actions' },
                    ]}
                    labels={{ token: 'Asset' }}
                  />
                  <tbody>
                    {isLoadingPrimary && groupEntries.length === 0
                      ? skeletonRows.map((_, i) => (
                        <tr key={"sk-" + group.type + i} className={`table-row ${i === skeletonRows.length - 1 ? '' : 'tbody-divider'}`}>
                          <td className="td col-name">
                            <span className="flex align-center gap-8">
                              <Skeleton width={26} height={26} className="circle" />
                              <Skeleton width={140} className="text" />
                            </span>
                          </td>
                          <td className="td td-right col-current"><Skeleton width={60} className="text" /></td>
                          <td className="td td-right col-target"><Skeleton width={60} className="text" /></td>
                          <td className="td td-right col-diff"><Skeleton width={60} className="text" /></td>
                          <td className="td col-note text-secondary"><Skeleton width={40} className="text" /></td>
                          <td className="td td-right col-actions"><div className="flex-end gap-6"><Skeleton width={34} height={34} /><Skeleton width={34} height={34} /></div></td>
                        </tr>
                      ))
                      : groupEntries.map((row, idx) => {
                        let assetOpt = null;
                        if (row.assetType === ITEM_TYPES.WALLET)
                          assetOpt = tokensList.find((o) => o.id === row.assetId);
                        else if (row.assetType === ITEM_TYPES.LIQUIDITY_POOL)
                          assetOpt = poolsList.find((o) => o.id === row.assetId);
                        else if (row.assetType === ITEM_TYPES.LENDING_AND_BORROWING)
                          assetOpt = lendingList.find((o) => o.id === row.assetId);
                        else if (row.assetType === ITEM_TYPES.STAKING)
                          assetOpt = stakingList.find((o) => o.id === row.assetId);

                        const renderAssetIcons = () => {
                          if (!assetOpt) return null;
                          const raw = assetOpt.raw || {};
                          if (row.assetType === ITEM_TYPES.WALLET) {
                            return (
                              <TokenDisplay
                                tokens={[raw]}
                                showName={false}
                                showText={false}
                                size={18}
                                gap={6}
                                showChain={true}
                              />
                            );
                          }
                          const pos = raw.position || raw;
                          let toks = [];
                          if (Array.isArray(pos?.tokens) && pos.tokens.length) {
                            toks = pos.tokens.map((x) => (x && x.token ? x.token : x));
                          } else if (Array.isArray(pos?.pool?.tokens) && pos.pool.tokens.length) {
                            toks = pos.pool.tokens.map((x) => (x && x.token ? x.token : x));
                          } else {
                            const t0 = pos.token0 || pos.tokenA || pos.baseToken || pos.primaryToken;
                            const t1 = pos.token1 || pos.tokenB || pos.quoteToken || pos.secondaryToken;
                            if (t0) toks.push(t0 && t0.token ? t0.token : t0);
                            if (t1) toks.push(t1 && t1.token ? t1.token : t1);
                          }
                          toks = toks.filter(Boolean);
                          if (toks.length >= 2)
                            return (
                              <TokenDisplay
                                tokens={[toks[0], toks[1]]}
                                showName={false}
                                showText={false}
                                size={18}
                                gap={6}
                                showChain={true}
                              />
                            );
                          if (toks.length === 1)
                            return (
                              <TokenDisplay
                                tokens={[toks[0]]}
                                showName={false}
                                showText={false}
                                size={18}
                                gap={6}
                                showChain={true}
                              />
                            );
                          return <div className="icon-circle" />;
                        };

                        const bucket = bucketKey(row);
                        const curSum = bucketCurrentSums.get(bucket) || 0;
                        const noteSum = bucketNoteSums.get(bucket) || 0;
                        const curVal = entryCurrentValues.get(row.id) || 0;
                        const pctCurrent = curSum > 0 ? (curVal / curSum) * 100 : 0;
                        const pctTarget = noteSum > 0 ? ((Number(row.note) || 0) / noteSum) * 100 : 0;
                        const fmtPct = (n) => formatPercent(n, { decimals: 2 });
                        const fmtUSD = (n) => formatUsd(n, { decimals: 2 });
                        const targetVal = noteSum > 0 ? ((Number(row.note) || 0) / noteSum) * curSum : 0;
                        const diffVal = targetVal - curVal;

                        return (
                          <tr key={row.id} className={`table-row table-row-hover ${idx === groupEntries.length - 1 ? '' : 'tbody-divider'}`}>
                            <td className="td text-primary col-name">
                              <span className="flex align-center gap-8" title={row.assetLabel}>
                                {renderAssetIcons()}
                                <span className="truncate" style={{maxWidth:'240px'}}>{row.assetLabel}</span>
                              </span>
                            </td>
                            <td className="td td-right td-mono tabular-nums text-primary col-current">
                              <ValueWithTooltip
                                value={fmtPct(Math.max(0, pctCurrent))}
                                tooltip={`Current: ${fmtUSD(curVal)}`}
                              />
                            </td>
                            <td className="td td-right td-mono tabular-nums text-primary col-target">
                              <ValueWithTooltip
                                value={fmtPct(Math.max(0, pctTarget))}
                                tooltip={`Target: ${fmtUSD(targetVal)}`}
                              />
                            </td>
                            <td className="td td-right td-mono tabular-nums text-primary col-diff">
                              {(() => {
                                const diffPct = pctTarget - pctCurrent;
                                const cls = diffPct > 0 ? 'text-positive' : diffPct < 0 ? 'text-negative' : 'text-secondary';
                                const arrow = diffPct > 0 ? '▲' : diffPct < 0 ? '▼' : '•';
                                return (
                                  <ValueWithTooltip
                                    value={`${arrow} ${formatPercent(diffPct, { decimals: 2, sign: true })}`}
                                    tooltip={`Diff: ${fmtUSD(diffVal)}`}
                                    className={cls}
                                  />
                                );
                              })()}
                            </td>
                            <td className="td col-note text-secondary">
                              {row.note || '-'}
                            </td>
                            <td className="td td-right col-actions">
                              <div className="flex-end gap-6 w-full">
                                <IconButton
                                  label="Edit"
                                  size={34}
                                  onClick={() => {
                                    setEditingId(row.id);
                                    setShowDialog(true);
                                    setAssetType(row.assetType);
                                    setAssetId(row.assetId);
                                    setReferenceType(row.referenceType);
                                    setReferenceValue(row.referenceValue || '');
                                    setNote(row.note || 0);
                                  }}
                                  icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9" />
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                    </svg>
                                  }
                                />
                                <IconButton
                                  label="Delete"
                                  size={34}
                                  variant="danger"
                                  onClick={() => removeEntry(row.id)}
                                  icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </CollapsibleMenu>
            );
          })}
        </div>
      )}
      {/* Save bar */}
      <div className="save-bar mt-20">
        <div>
          {saveResult ? (
            <span>
              Saved: key {saveResult.key} • items {saveResult.itemsCount} • accounts{' '}
              {Array.isArray(saveResult.accounts) ? saveResult.accounts.join(', ') : ''}
            </span>
          ) : (
            <span>{entries.length ? 'Add more items or save your configuration' : 'Add items and click Save to persist'}</span>
          )}
        </div>
        <button
          disabled={saving || entries.length === 0}
          className="btn btn--primary"
          onClick={async () => {
            try {
              setSaving(true);
              setSaveResult(null);
              const payload = {
                AccountId: account || undefined,
                Items: entries.map((e) => ({
                  Version: '1',
                  Asset: e.assetId,
                  Type: e.assetType,
                  Note: e.note,
                  ByGroupType: REF_ENUM_MAP[e.referenceType] ?? 0,
                  Value:
                    e.referenceType === RebalanceReferenceType.TotalWallet
                      ? null
                      : e.referenceValue || e.referenceLabel,
                })),
              };
              const res = await fetch(`${config.API_BASE_URL}/api/v1/rebalances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              if (!res.ok) {
                let msg = `Save failed: ${res.status} ${res.statusText}`;
                try {
                  const errJson = await res.json();
                  if (errJson?.title || errJson?.error)
                    msg += ` - ${errJson.title || errJson.error}`;
                  if (errJson?.errors) msg += `\n${JSON.stringify(errJson.errors)}`;
                } catch {
                  const text = await res.text();
                  if (text) msg += ` - ${text}`;
                }
                throw new Error(msg);
              }
              const data = await res.json();
              setSaveResult({
                key: data.key,
                itemsCount: data.itemsCount,
                accounts: data.accounts,
              });
            } catch (err) {
              console.error('Save error', err);
              alert(err.message || 'Save failed');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function AssetDropdown({
  theme,
  assetType,
  value,
  options,
  onChange,
  tokensList = [],
  placeholder = 'Select asset…',
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find((o) => o.id === value);

  const renderPreview = () => {
    if (!selected)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Ghost icon placeholder to keep height stable (matches TokenDisplay size 18, pair width ~21) */}
          <div style={{ position: 'relative', width: 21, height: 18, flex: '0 0 auto' }}>
            <div style={{ position: 'absolute', left: 0, top: 2, width: 14, height: 14 }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'transparent',
                }}
              />
            </div>
            <div style={{ position: 'absolute', left: 7, top: 2, width: 14, height: 14 }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'transparent',
                }}
              />
            </div>
          </div>
          <span style={{ color: theme.textSecondary }}>{placeholder}</span>
        </div>
      );
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {renderAssetIcon(assetType, selected)}
        <span style={{ color: theme.textPrimary }}>{selected.label}</span>
      </div>
    );
  };

  const getLogoFromAny = (t) => {
    if (!t || typeof t !== 'object') return '';
    return (
      t.logo ||
      t.logoURI ||
      t.image ||
      t.icon ||
      t.logoUrl ||
      t.logo_url ||
      t.iconUrl ||
      t.icon_url ||
      ''
    );
  };

  const renderAssetIcon = (type, opt) => {
    const raw = opt.raw || {};
    if (type === ITEM_TYPES.WALLET) {
      const tok = raw;
      return (
        <TokenDisplay
          tokens={[tok]}
          showName={false}
          showText={false}
          size={18}
          gap={6}
          showChain={true}
        />
      );
    }
    if (type === 'PROTOCOL') {
      const logo = getLogoFromAny(raw);
      if (logo) {
        return (
          <div style={{ position: 'relative', width: 18, height: 18, flex: '0 0 auto' }}>
            <img
              src={logo}
              alt="protocol"
              style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
        );
      }
      return (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: theme.bgPanel,
            border: `1px solid ${theme.border}`,
          }}
        />
      );
    }
    const pos = raw.position || raw;
    // Try multiple shapes to extract up to 2 tokens with logo/symbol/name
    let toks = [];
    if (Array.isArray(pos?.tokens) && pos.tokens.length) {
      toks = pos.tokens.map((x) => (x && x.token ? x.token : x));
    } else if (Array.isArray(pos?.pool?.tokens) && pos.pool.tokens.length) {
      toks = pos.pool.tokens.map((x) => (x && x.token ? x.token : x));
    } else {
      const t0 = pos.token0 || pos.tokenA || pos.baseToken || pos.primaryToken;
      const t1 = pos.token1 || pos.tokenB || pos.quoteToken || pos.secondaryToken;
      if (t0) toks.push(t0 && t0.token ? t0.token : t0);
      if (t1) toks.push(t1 && t1.token ? t1.token : t1);
    }
    toks = toks.filter(Boolean);
    // No token logo fallbacks: rely only on provided logo fields
    if (toks.length >= 2) {
      return (
        <TokenDisplay
          tokens={[toks[0], toks[1]]}
          showName={false}
          showText={false}
          size={18}
          gap={6}
          showChain={true}
        />
      );
    }
    if (toks.length === 1) {
      return (
        <TokenDisplay
          tokens={[toks[0]]}
          showName={false}
          showText={false}
          size={18}
          gap={6}
          showChain={true}
        />
      );
    }
    // Fallback icon
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: theme.bgPanel,
          border: `1px solid ${theme.border}`,
        }}
      />
    );
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        className="dropdown-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-8 min-w-0 flex-1">{renderPreview()}</div>
        <span className="text-secondary">▾</span>
      </button>
      {open && (
        <div className="dropdown-menu" role="listbox">
          <div className="pad-6">
            <button
              type="button"
              className="dropdown-option text-secondary"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <span>— None —</span>
            </button>
            {options.map((opt, idx) => (
              <button
                key={`${opt.id}-${idx}`}
                type="button"
                className="dropdown-option"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {renderAssetIcon(assetType, opt)}
                <span className="text-ellipsis-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
