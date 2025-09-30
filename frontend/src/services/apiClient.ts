import axios from 'axios';

import { api } from '../config/api';
import { HealthStatus, SupportedChain } from '../types/api';

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

// getWallet removed (replaced by aggregation workflow)
