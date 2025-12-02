import axios from 'axios';

import { api } from '../config/api';
import { HealthStatus, SupportedChain } from '../types/api';
import type {
  WalletGroup,
  CreateWalletGroupRequest,
  UpdateWalletGroupRequest,
  ConnectWalletGroupResponse,
  ConnectWalletGroupRequest,
} from '../types/wallet-groups';
import type { Challenge } from './proofOfWork';

// JWT Token Storage
const TOKEN_STORAGE_KEY = 'defi10_wallet_group_tokens';

interface StoredToken {
  walletGroupId: string;
  token: string;
  expiresAt: string;
}

// Get all stored tokens
function getStoredTokens(): StoredToken[] {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get token for specific wallet group
function getToken(walletGroupId: string): string | null {
  const tokens = getStoredTokens();
  const tokenData = tokens.find(t => t.walletGroupId === walletGroupId);
  
  if (!tokenData) return null;
  
  // Check if token is expired
  const expiresAt = new Date(tokenData.expiresAt);
  if (expiresAt <= new Date()) {
    // Token expired, remove it
    removeToken(walletGroupId);
    return null;
  }
  
  return tokenData.token;
}

// Store token for wallet group
function storeToken(walletGroupId: string, token: string, expiresAt: string): void {
  const tokens = getStoredTokens();
  const filtered = tokens.filter(t => t.walletGroupId !== walletGroupId);
  filtered.push({ walletGroupId, token, expiresAt });
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(filtered));
}

// Remove token for wallet group
function removeToken(walletGroupId: string): void {
  const tokens = getStoredTokens();
  const filtered = tokens.filter(t => t.walletGroupId !== walletGroupId);
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(filtered));
}

// Configure axios interceptor to add Bearer token
axios.interceptors.request.use((config) => {
  // Extract wallet group ID from URL if present
  const match = config.url?.match(/\/wallet-groups\/([^\/]+)/);
  if (match && match[1] && match[1] !== 'challenge') {
    const walletGroupId = decodeURIComponent(match[1]);
    const token = getToken(walletGroupId);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Generic GET helper with simple error normalization
async function getJSON<T>(url: string): Promise<T> {
  const res = await axios.get(url);
  return res.data as T;
}

export async function getHealth(): Promise<HealthStatus> {
  return getJSON<HealthStatus>(api.health());
}

export async function getSupportedChains(): Promise<SupportedChain[]> {
  const data = await getJSON<{ chains?: SupportedChain[] }>(api.getSupportedChains());
  return data.chains || [];
}

// Wallet Groups API - Challenge endpoint
export async function getChallenge(): Promise<Challenge> {
  const res = await axios.get(api.getChallenge());
  return res.data;
}

// Wallet Groups API
export async function createWalletGroup(data: CreateWalletGroupRequest): Promise<WalletGroup> {
  const res = await axios.post(api.createWalletGroup(), data);
  const walletGroup = res.data;
  
  // If group was created with password, automatically connect to get token
  if (data.password) {
    try {
      await connectWalletGroup(walletGroup.id, { password: data.password });
    } catch (err) {
      console.warn('[WalletGroup] Failed to auto-connect after creation:', err);
    }
  } else {
    // No password - connect without password to get token
    try {
      await connectWalletGroup(walletGroup.id, {});
    } catch (err) {
      console.warn('[WalletGroup] Failed to auto-connect without password:', err);
    }
  }
  
  return walletGroup;
}

export async function connectWalletGroup(
  id: string,
  data: ConnectWalletGroupRequest
): Promise<ConnectWalletGroupResponse> {
  const res = await axios.post(api.connectWalletGroup(id), data);
  const response: ConnectWalletGroupResponse = res.data;
  
  // Store token for future requests
  storeToken(response.walletGroupId, response.token, response.expiresAt);
  
  console.log('[WalletGroup] Connected and token stored for group:', response.walletGroupId);
  return response;
}

export async function getWalletGroup(id: string): Promise<WalletGroup> {
  const res = await axios.get(api.getWalletGroup(id));
  return res.data;
}

export async function updateWalletGroup(
  id: string,
  data: UpdateWalletGroupRequest
): Promise<WalletGroup> {
  const res = await axios.put(api.updateWalletGroup(id), data);
  return res.data;
}

export async function deleteWalletGroup(id: string): Promise<void> {
  await axios.delete(api.deleteWalletGroup(id));
  // Remove token after deletion
  removeToken(id);
}

// Export token management functions for external use
export { getToken, storeToken, removeToken };

// getWallet removed (replaced by aggregation workflow)
