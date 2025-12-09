# DeFi10 Frontend

A comprehensive multi-chain DeFi portfolio tracker that aggregates and displays your assets across multiple blockchain protocols and networks.

## Overview

DeFi10 is a modern web application built with React and Vite that provides real-time tracking and analytics for decentralized finance (DeFi) positions. It connects to blockchain networks to fetch and display your liquidity pools, lending positions, staking rewards, and wallet balances in a unified dashboard.

## Key Features

- **Multi-Chain Support**: Track assets across multiple blockchain networks (Base, BNB Chain, and more)
- **Wallet Groups**: Organize multiple wallet addresses into groups for consolidated portfolio views
- **Real-Time Aggregation**: Background jobs aggregate data from various DeFi protocols
- **Comprehensive Asset Types**:
  - Liquidity Pool positions (Uniswap V3, Aerodrome, etc.)
  - Lending & Borrowing positions (Aave, Compound, etc.)
  - Staking positions
  - Locking positions
  - Deposit positions
  - Native wallet balances
- **Advanced Analytics**:
  - Portfolio breakdown by protocol and asset type
  - Risk analysis with health factors
  - 24h fees tracking for liquidity pools
  - Range monitoring for concentrated liquidity positions
- **Privacy Features**:
  - Optional value masking for screenshots/sharing
  - Local token storage with expiration management
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Theme Support**: Light and dark mode

## Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Blockchain Integration**: ethers.js v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with theme system
- **Type Safety**: TypeScript (partial migration in progress)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- Backend API running (see backend repository)

### Installation

1. Clone the repository and navigate to the frontend folder:

   ```bash
   cd DeFi10/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Production Build

```bash
npm run build
npm run preview
```

### Deployment

The application can be deployed to Render.com or any static hosting service:

```bash
npm start  # Uses express server (see server.cjs)
```

## Project Structure

```
src/
├── components/       # React components (UI, tables, charts)
├── config/          # API configuration
├── constants/       # App constants and configs
├── context/         # React context providers (theme, mask values)
├── hooks/           # Custom React hooks
├── services/        # API client and external services
├── styles/          # Global styles and theme definitions
├── theme/           # Theme tokens and CSS variables
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

## Key Concepts

### Wallet Groups

Wallet Groups allow you to organize multiple blockchain addresses under a single authenticated entity. Each group:
- Has a unique ID (GUID)
- Can be password-protected
- Supports multi-address aggregation
- Stores authentication tokens with expiration
- Provides URL-based sharing (`/portfolio/{groupId}`)

### Aggregation Jobs

Data aggregation is handled through background jobs that:
1. Accept a wallet address or wallet group ID
2. Query multiple DeFi protocols across chains
3. Return structured data with protocol, token, and position details
4. Support polling for long-running operations
5. Provide partial results during processing

### Type System

The application uses a unified `WalletItem` type system:
- `type`: 'Wallet' | 'LiquidityPool' | 'LendingAndBorrowing' | 'Staking' | 'Locking' | 'Depositing'
- Each type has specific metadata (health factors, pool ranges, APY, etc.)
- Type-safe extractors for protocol-specific data
- Validation utilities for data integrity

## API Integration

The frontend communicates with a backend API that provides:
- `/api/v1/aggregations` - Start and poll aggregation jobs
- `/api/v1/wallet-groups` - CRUD operations for wallet groups
- `/api/v1/protocols/status` - Protocol availability status
- `/api/v1/wallets/supported-chains` - List of supported chains

Token authentication is handled automatically via axios interceptors with:
- Bearer token injection
- Automatic token expiration detection (401 handling)
- Reconnection flow for expired sessions

## Development

### Code Style

- ESLint configuration with custom rules
- Prettier for formatting
- Prefer `.tsx` files over `.jsx` for new components
- Use TypeScript types from `src/types/`

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run format     # Format with Prettier
```

## Contributing

When contributing:
1. Prefer TypeScript over JavaScript for new code
2. Use the unified `WalletItem` type system
3. Follow existing component patterns
4. Add proper error handling for API calls
5. Test with multiple wallet addresses and chains

## License

This project is private and proprietary.

## Support

For issues, questions, or feature requests, please contact the development team.

