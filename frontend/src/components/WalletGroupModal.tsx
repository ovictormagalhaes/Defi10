import React, { useState, useEffect } from 'react';

import { useTheme } from '../context/ThemeProvider.tsx';
import { useWalletGroups } from '../hooks/useWalletGroups';
import {
  validateSingleAddress,
  getAddressType,
  formatAddress,
  validateWalletGroup,
} from '../types/wallet-groups';

interface WalletGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (groupId: string) => void;
  onGroupSelected?: (groupId: string) => void;
  currentWalletAddress?: string | null; // Current connected wallet to add to group
  onConnectToGroup?: (groupId: string) => void; // Callback when wallet is connected to group
}

const WalletGroupModal: React.FC<WalletGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
  onGroupSelected,
  currentWalletAddress,
  onConnectToGroup,
}) => {
  const { theme } = useTheme();
  const { groups, loading, error, createGroup, updateGroup, deleteGroup, clearError } = useWalletGroups();

  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'addWallet' | 'connect'>('list');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);
  const [connectGroupId, setConnectGroupId] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [walletInputs, setWalletInputs] = useState(['', '', '']);
  const [validationErrors, setValidationErrors] = useState<(string | null)[]>([null, null, null]);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode('list');
      setEditingGroupId(null);
      setAddingToGroupId(null);
      setConnectGroupId('');
      setDisplayName('');
      setWalletInputs(['', '', '']);
      setValidationErrors([null, null, null]);
      setGroupError(null);
      clearError();
    }
  }, [isOpen, clearError]);

  const handleWalletInput = (index: number, value: string) => {
    const updated = [...walletInputs];
    updated[index] = value.trim();
    setWalletInputs(updated);

    // Validate individual address
    const errors = [...validationErrors];
    if (value.trim().length > 0) {
      const validation = validateSingleAddress(value.trim());
      errors[index] = validation.valid ? null : validation.error || null;
    } else {
      errors[index] = null;
    }
    setValidationErrors(errors);

    // Validate group as a whole
    const nonEmpty = updated.filter((w) => w.length > 0);
    if (nonEmpty.length > 0) {
      const groupValidation = validateWalletGroup(nonEmpty);
      setGroupError(groupValidation.valid ? null : groupValidation.error || null);
    } else {
      setGroupError(null);
    }
  };

  const handleCreateGroup = async () => {
    const wallets = walletInputs.filter((w) => w.length > 0);

    if (wallets.length === 0) {
      setGroupError('Please add at least one wallet address');
      return;
    }

    const result = await createGroup({
      wallets,
      displayName: displayName.trim() || undefined,
    });

    if (result) {
      // Success - reset form and notify parent
      resetForm();

      if (onGroupCreated) {
        onGroupCreated(result.id);
      }
      setMode('list');
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroupId) return;

    const wallets = walletInputs.filter((w) => w.length > 0);

    if (wallets.length === 0) {
      setGroupError('Please add at least one wallet address');
      return;
    }

    const result = await updateGroup(editingGroupId, {
      wallets,
      displayName: displayName.trim() || undefined,
    });

    if (result) {
      resetForm();
      setMode('list');
      setEditingGroupId(null);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setEditingGroupId(groupId);
    setDisplayName(group.displayName || '');
    const wallets = [...group.wallets];
    // Pad to 3 slots
    while (wallets.length < 3) wallets.push('');
    setWalletInputs(wallets);
    setValidationErrors([null, null, null]);
    setGroupError(null);
    setMode('edit');
  };

  const handleAddWalletToGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    setAddingToGroupId(groupId);
    setDisplayName(group.displayName || '');
    setWalletInputs(['', '', '']); // Empty inputs for new wallets
    setValidationErrors([null, null, null]);
    setGroupError(null);
    setMode('addWallet');
  };

  const handleAddWalletSubmit = async () => {
    if (!addingToGroupId) return;

    const group = groups.find((g) => g.id === addingToGroupId);
    if (!group) return;

    const newWallets = walletInputs.filter((w) => w.length > 0);
    if (newWallets.length === 0) {
      setGroupError('Please add at least one wallet address');
      return;
    }

    // Merge existing wallets with new ones
    const allWallets = [...group.wallets, ...newWallets];

    const result = await updateGroup(addingToGroupId, {
      wallets: allWallets,
      displayName: group.displayName || undefined,
    });

    if (result) {
      resetForm();
      setMode('list');
    }
  };

  const resetForm = () => {
    setDisplayName('');
    setWalletInputs(['', '', '']);
    setValidationErrors([null, null, null]);
    setGroupError(null);
    setEditingGroupId(null);
    setAddingToGroupId(null);
    setConnectGroupId('');
  };

  const cancelForm = () => {
    resetForm();
    setMode('list');
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wallet group?')) {
      return;
    }
    await deleteGroup(id);
  };

  const handleConnectCurrentWallet = async (groupId: string) => {
    if (!currentWalletAddress) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    // Check if wallet is already in the group
    if (group.wallets.includes(currentWalletAddress)) {
      alert('This wallet is already connected to this group');
      return;
    }

    // Add current wallet to the group
    const result = await updateGroup(groupId, {
      wallets: [...group.wallets, currentWalletAddress],
      displayName: group.displayName || undefined,
    });

    if (result && onConnectToGroup) {
      onConnectToGroup(groupId);
      onClose();
    }
  };

  const handleConnectToExistingGroup = async () => {
    const trimmedId = connectGroupId.trim();
    
    if (!trimmedId) {
      setGroupError('Please enter a Group ID');
      return;
    }

    setLoading(true);
    setGroupError(null);

    try {
      // Try to fetch the group from the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'}/api/v1/wallet-groups/${encodeURIComponent(trimmedId)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setGroupError('Group not found. Please check the ID and try again.');
        } else {
          setGroupError('Failed to connect to group. Please try again.');
        }
        setLoading(false);
        return;
      }

      const group = await response.json();
      
      // Check if group already exists locally
      const existingGroup = groups.find(g => g.id === group.id);
      if (existingGroup) {
        setGroupError('This group is already in your list');
        setLoading(false);
        return;
      }

      // Add group to local storage (the hook will handle persistence)
      const updatedGroups = [...groups, group];
      localStorage.setItem('defi10_wallet_groups', JSON.stringify(updatedGroups));
      
      // Trigger selection if callback provided
      if (onGroupSelected) {
        onGroupSelected(group.id);
      }
      
      setLoading(false);
      onClose();
      
    } catch (err) {
      console.error('Error connecting to group:', err);
      setGroupError('Failed to connect to group. Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasValidationError = validationErrors.some((e) => e !== null);
  const canSubmit = walletInputs.some((w) => w.length > 0) && !hasValidationError && !groupError;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.bgPanel,
          borderRadius: 20,
          maxWidth: 700,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 600,
                color: theme.textPrimary,
                letterSpacing: 0.3,
              }}
            >
              Wallet Groups
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: 13,
                color: theme.textSecondary,
              }}
            >
              {mode === 'list'
                ? 'Manage your wallet collections'
                : mode === 'create'
                  ? 'Create a new wallet group'
                  : mode === 'addWallet'
                    ? 'Add wallet to group'
                    : mode === 'connect'
                      ? 'Connect to existing group'
                      : 'Edit wallet group'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: theme.textSecondary,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bgPanelHover;
              e.currentTarget.style.color = theme.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            boxSizing: 'border-box',
          }}
        >
          {mode === 'list' ? (
            <>
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <button
                  onClick={() => {
                    resetForm();
                    setMode('create');
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create New Group
                </button>
                
                <button
                  onClick={() => {
                    resetForm();
                    setMode('connect');
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: 'transparent',
                    border: `2px solid ${theme.border}`,
                    borderRadius: 12,
                    color: theme.textPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgPanelHover;
                    e.currentTarget.style.borderColor = theme.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Connect to Group
                </button>
              </div>

              {/* Groups List */}
              {groups.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    color: theme.textSecondary,
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ margin: '0 auto 16px', opacity: 0.5 }}
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <p style={{ fontSize: 14, margin: 0 }}>No wallet groups yet</p>
                  <p style={{ fontSize: 12, margin: '8px 0 0 0', opacity: 0.7 }}>
                    Create your first group to get started
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      style={{
                        background: theme.bgApp,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 14,
                        padding: 18,
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.borderHover || theme.border;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.border;
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: 16,
                              fontWeight: 600,
                              color: theme.textPrimary,
                              marginBottom: 4,
                            }}
                          >
                            {group.displayName || 'Unnamed Group'}
                          </h4>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: theme.textSecondary,
                            }}
                          >
                            {group.wallets.length} wallet{group.wallets.length !== 1 ? 's' : ''} •{' '}
                            Created {new Date(group.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                          {onGroupSelected && (
                            <button
                              onClick={() => {
                                onGroupSelected(group.id);
                                onClose();
                              }}
                              disabled={loading}
                              style={{
                                padding: '6px 14px',
                                background: theme.primarySubtle,
                                border: `1px solid ${theme.border}`,
                                borderRadius: 8,
                                color: theme.textPrimary,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1,
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.background = theme.primary;
                              }}
                              onMouseLeave={(e) => {
                                if (!loading) e.currentTarget.style.background = theme.primarySubtle;
                              }}
                            >
                              Select
                            </button>
                          )}
                          <button
                            onClick={() => handleAddWalletToGroup(group.id)}
                            disabled={loading}
                            style={{
                              padding: '6px 14px',
                              background: 'transparent',
                              border: `1px solid ${theme.border}`,
                              borderRadius: 8,
                              color: theme.accent || theme.primary,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.5 : 1,
                              transition: 'all 0.15s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) e.currentTarget.style.background = theme.bgPanelHover;
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add
                          </button>
                          <button
                            onClick={() => handleEditGroup(group.id)}
                            disabled={loading}
                            style={{
                              padding: '6px 14px',
                              background: 'transparent',
                              border: `1px solid ${theme.border}`,
                              borderRadius: 8,
                              color: theme.textPrimary,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.5 : 1,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) e.currentTarget.style.background = theme.bgPanelHover;
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={loading}
                            style={{
                              padding: '6px 10px',
                              background: 'transparent',
                              border: `1px solid ${theme.border}`,
                              borderRadius: 8,
                              color: theme.danger || '#ef4444',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.5 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) {
                                e.currentTarget.style.background =
                                  'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.borderColor = theme.danger || '#ef4444';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = theme.border;
                              }
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Wallets */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {group.wallets.map((w, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 12px',
                              background: theme.bgPanel,
                              border: `1px solid ${theme.border}`,
                              borderRadius: 10,
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                padding: '3px 8px',
                                background: theme.primarySubtle,
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                color: theme.textPrimary,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {getAddressType(w)}
                            </span>
                            <code
                              style={{
                                flex: 1,
                                color: theme.textSecondary,
                                fontFamily: 'monospace',
                                fontSize: 12,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-all',
                              }}
                            >
                              {formatAddress(w, 10)}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : mode === 'connect' ? (
            <>
              {/* Connect to Existing Group Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label
                    htmlFor="group-id"
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    Group ID
                  </label>
                  <input
                    id="group-id"
                    type="text"
                    placeholder="Enter the wallet group ID"
                    value={connectGroupId}
                    onChange={(e) => {
                      setConnectGroupId(e.target.value);
                      setGroupError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1px solid ${groupError ? theme.danger || '#ef4444' : theme.border}`,
                      background: theme.bgApp,
                      color: theme.textPrimary,
                      fontSize: 14,
                      fontFamily: 'monospace',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = groupError ? theme.danger || '#ef4444' : theme.primary)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = groupError ? theme.danger || '#ef4444' : theme.border)}
                  />
                  {groupError && (
                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: 12,
                        color: theme.danger || '#ef4444',
                      }}
                    >
                      {groupError}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: theme.bgPanel,
                    borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ verticalAlign: 'text-bottom', marginRight: 6 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    Enter the Group ID from another device to sync your wallet collections across devices.
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${theme.danger || '#ef4444'}`,
                      borderRadius: 10,
                      color: theme.danger || '#ef4444',
                      fontSize: 13,
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Form: Create, Edit, or Add Wallet */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Group Name - only show in create/edit mode, not in addWallet */}
                {mode !== 'addWallet' && (
                  <div>
                    <label
                      htmlFor="group-name"
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.textPrimary,
                        marginBottom: 8,
                      }}
                    >
                      Group Name <span style={{ opacity: 0.5 }}>(optional)</span>
                    </label>
                    <input
                      id="group-name"
                      type="text"
                      placeholder="e.g., Main Portfolio"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: `1px solid ${theme.border}`,
                        background: theme.bgApp,
                        color: theme.textPrimary,
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.15s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = theme.border)}
                    />
                  </div>
                )}

                {/* Show group name as readonly in addWallet mode */}
                {mode === 'addWallet' && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.textPrimary,
                        marginBottom: 8,
                      }}
                    >
                      Adding to Group
                    </label>
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: theme.bgPanel,
                        color: theme.textPrimary,
                        fontSize: 14,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {displayName || 'Unnamed Group'}
                    </div>
                  </div>
                )}

                {/* Wallets */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    Wallet Addresses <span style={{ opacity: 0.5 }}>(max 3)</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {walletInputs.map((wallet, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: theme.primarySubtle,
                              color: theme.textPrimary,
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <input
                            id={`wallet-${idx}`}
                            type="text"
                            placeholder={`0x... or Solana address ${idx === 0 ? '(required)' : ''}`}
                            value={wallet}
                            onChange={(e) => handleWalletInput(idx, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: `1px solid ${validationErrors[idx] ? theme.danger || '#ef4444' : theme.border}`,
                              background: theme.bgApp,
                              color: theme.textPrimary,
                              fontSize: 13,
                              fontFamily: 'monospace',
                              outline: 'none',
                              transition: 'border-color 0.15s',
                              boxSizing: 'border-box',
                              minWidth: 0,
                            }}
                            onFocus={(e) =>
                              (e.currentTarget.style.borderColor = validationErrors[idx]
                                ? theme.danger || '#ef4444'
                                : theme.primary)
                            }
                            onBlur={(e) =>
                              (e.currentTarget.style.borderColor = validationErrors[idx]
                                ? theme.danger || '#ef4444'
                                : theme.border)
                            }
                          />
                          {wallet && !validationErrors[idx] && (
                            <span
                              style={{
                                padding: '6px 10px',
                                background: theme.success + '20' || '#10b98120',
                                color: theme.success || '#10b981',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              {getAddressType(wallet)}
                            </span>
                          )}
                        </div>
                        {validationErrors[idx] && (
                          <div
                            style={{
                              marginTop: 6,
                              marginLeft: 32,
                              fontSize: 12,
                              color: theme.danger || '#ef4444',
                            }}
                          >
                            {validationErrors[idx]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors */}
                {(groupError || error) && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: (theme.danger || '#ef4444') + '15',
                      border: `1px solid ${theme.danger || '#ef4444'}`,
                      borderRadius: 10,
                      color: theme.danger || '#ef4444',
                      fontSize: 13,
                    }}
                  >
                    {groupError || error}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {mode !== 'list' && (
          <div
            style={{
              padding: '20px 28px',
              borderTop: `1px solid ${theme.border}`,
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={cancelForm}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                color: theme.textPrimary,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.bgPanelHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={
                mode === 'edit'
                  ? handleUpdateGroup
                  : mode === 'addWallet'
                    ? handleAddWalletSubmit
                    : mode === 'connect'
                      ? handleConnectToExistingGroup
                      : handleCreateGroup
              }
              disabled={loading || (mode === 'connect' ? !connectGroupId.trim() : !canSubmit)}
              style={{
                padding: '10px 24px',
                background:
                  loading || (mode === 'connect' ? !connectGroupId.trim() : !canSubmit)
                    ? theme.textMuted
                    : `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: loading || (mode === 'connect' ? !connectGroupId.trim() : !canSubmit) ? 'not-allowed' : 'pointer',
                opacity: loading || (mode === 'connect' ? !connectGroupId.trim() : !canSubmit) ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!loading && (mode === 'connect' ? connectGroupId.trim() : canSubmit)) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && (mode === 'connect' ? connectGroupId.trim() : canSubmit)) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading
                ? 'Connecting...'
                : mode === 'edit'
                  ? 'Update Group'
                  : mode === 'addWallet'
                    ? 'Add Wallets'
                    : mode === 'connect'
                      ? 'Connect to Group'
                      : 'Create Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletGroupModal;
