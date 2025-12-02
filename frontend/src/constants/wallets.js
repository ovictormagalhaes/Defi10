/**
 * Centralized wallet configuration
 * Add new wallets here and they will appear in all components automatically
 */

export const WALLETS = [
  {
    id: 'rabby',
    name: 'Rabby',
    description: 'Connect with Rabby',
    icon: '🐰',
    color: '#8697FF',
    type: 'evm',
    detectFn: () => {
      // Rabby injeta window.rabby
      return !!window.rabby;
    },
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect with MetaMask',
    icon: '🦊',
    color: '#F6851B',
    type: 'evm',
    detectFn: () => {
      // MetaMask está presente se window.ethereum existe
      // Ambos Rabby e MetaMask podem coexistir
      return !!window.ethereum;
    },
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Connect with Phantom',
    icon: '👻',
    color: '#AB9FF2',
    type: 'solana',
    detectFn: () => window.solana && window.solana.isPhantom,
  },
];

/**
 * Detect available wallets in the browser
 * @returns {Object} Object with wallet ids as keys and boolean availability as values
 */
export function detectAvailableWallets() {
  const available = {};
  WALLETS.forEach((wallet) => {
    available[wallet.id] = wallet.detectFn();
  });
  
  return available;
}

/**
 * Get wallet configuration by id
 * @param {string} walletId
 * @returns {Object|null}
 */
export function getWalletById(walletId) {
  return WALLETS.find((w) => w.id === walletId) || null;
}

/**
 * Check if any wallet is available
 * @returns {boolean}
 */
export function hasAnyWallet() {
  return WALLETS.some((wallet) => wallet.detectFn());
}

/**
 * Get wallet names for error messages
 * @returns {string} Comma-separated wallet names
 */
export function getWalletNames() {
  return WALLETS.map((w) => w.name).join(', ');
}
