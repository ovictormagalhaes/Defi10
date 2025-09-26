// Central API types

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

export interface SupportedChain {
  id: string;
  chainId: number;
  name?: string;
  displayName?: string;
  iconUrl?: string;
  icon?: string;
  logo?: string;
  image?: string;
}

// Minimal wallet item typing based on current usage (totalPrice/value aggregation)
export interface WalletItemBase {
  network?: string;
  chain?: string;
  totalPrice?: number | string; // API can return string numbers
  value?: number | string;
}

// Allow forward compatibility with dynamic fields but keep them typed as unknown so callers must narrow.
export type WalletItem = WalletItemBase & Record<string, unknown>;

export interface WalletData {
  account: string;
  network: string;
  items: WalletItem[];
  lastUpdated: string;
}
