// Application constants and configuration

export const STORAGE_KEY = 'wallet_account';
export const EXPIRY_HOURS = 48;
// Central API base path should come from `config/api.ts` now; keep a fallback
// Import lazily where needed instead of hardcoding here. Retain legacy export for minimal disruption.
import { config } from '../config/api';
// Use resolved base from config; endpoints elsewhere append their own path segments.
export const API_BASE = config.API_BASE_URL + '/api/v1';

// Default state configurations
export const DEFAULT_COLUMN_VISIBILITY = {
  showBalanceColumn: true,
  showUnitPriceColumn: true,
  showPoolSubtotals: true,
};

export const DEFAULT_EXPANSION_STATES = {
  tokensExpanded: true,
  liquidityPoolsExpanded: true,
  defiPositionsExpanded: true,
};

export const DEFAULT_FILTER_SETTINGS = {
  showOnlyPositiveBalance: true,
};
