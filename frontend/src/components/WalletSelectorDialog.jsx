import React from 'react';

const WalletSelectorDialog = ({ isOpen, onClose, onSelectWallet, availableWallets }) => {
  if (!isOpen) return null;

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect with MetaMask',
      icon: '🦊',
      color: '#F6851B',
      available: availableWallets.metamask,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'Connect with Phantom',
      icon: '👻',
      color: '#AB9FF2',
      available: availableWallets.phantom,
    },
  ];

  const availableWalletsList = wallets.filter((w) => w.available);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--mw-bg-primary, #0f1419)',
          borderRadius: 20,
          maxWidth: 440,
          width: '100%',
          padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--mw-border, #2a3441)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--mw-text-primary, #e4e7eb)',
            }}
          >
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--mw-bg-secondary, #1a2028)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mw-text-secondary, #9ca3af)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: 14,
            color: 'var(--mw-text-secondary, #9ca3af)',
            lineHeight: 1.5,
          }}
        >
          Choose a wallet to connect to your account
        </p>

        {/* Wallet Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {availableWalletsList.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--mw-text-secondary, #9ca3af)',
                background: 'var(--mw-bg-secondary, #1a2028)',
                borderRadius: 12,
              }}
            >
              <p style={{ margin: '0 0 12px 0', fontSize: 15 }}>No wallet extension detected</p>
              <p style={{ margin: 0, fontSize: 13 }}>
                Please install MetaMask or Phantom to continue
              </p>
            </div>
          ) : (
            availableWalletsList.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onSelectWallet(wallet.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 18px',
                  background: 'var(--mw-bg-secondary, #1a2028)',
                  border: '1px solid var(--mw-border, #2a3441)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = wallet.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${wallet.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--mw-border, #2a3441)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: wallet.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {wallet.icon}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--mw-text-primary, #e4e7eb)',
                      marginBottom: 2,
                    }}
                  >
                    {wallet.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--mw-text-secondary, #9ca3af)',
                    }}
                  >
                    {wallet.description}
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--mw-text-secondary, #9ca3af)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletSelectorDialog;
