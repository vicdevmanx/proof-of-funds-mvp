// hooks/useMultiChain.ts
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useAppKitAccount } from '@reown/appkit/react';
import { getChainType, type ChainType } from '@/lib/multichain';

/**
 * useMultiChain Hook
 * 
 * Provides unified access to wallet connection data across all chains
 * Automatically detects which chain the user is connected to
 * Handles hydration mismatches and SSR compatibility
 * 
 * @returns {Object} Multi-chain account and connection state
 */
export function useMultiChain() {
  const { address: evmAddress, isConnected: isEvmConnected, isConnecting, isReconnecting } = useAccount();
  const { address: appKitAddress, isConnected: isAppKitConnected } = useAppKitAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use connected address with fallback
  const address = evmAddress || appKitAddress;
  const chainType = getChainType(address);
  
  // Check connection status from both sources
  // AppKit handles Solana and Bitcoin, Wagmi handles EVM
  const isConnected = isEvmConnected || isAppKitConnected || !!appKitAddress;
  const isLoading = isConnecting || isReconnecting || !mounted;

  return {
    address,
    chainType,
    isConnected,
    isLoading,
    chainId,
    isEvm: chainType === 'evm',
    isSolana: chainType === 'solana',
    isBitcoin: chainType === 'bitcoin',
  };
}

/**
 * useWalletBalance Hook
 * 
 * Gets balance for connected wallet
 * Currently supports EVM only - extend for Solana/Bitcoin as needed
 * 
 * @returns {Object} Balance data and loading state
 */
export function useWalletBalance() {
  const { address, isEvm } = useMultiChain();
  const { data: balance, isLoading, error } = useBalance({
    address: address as any,
    query: { enabled: !!address && isEvm },
  });

  return {
    balance: balance ? parseFloat(balance.formatted) : 0,
    symbol: balance?.symbol || 'ETH',
    decimals: balance?.decimals || 18,
    isLoading,
    error,
    formatted: balance?.formatted || '0',
  };
}

/**
 * useChainInfo Hook
 * 
 * Get human-readable information about connected chain
 * 
 * @returns {Object} Chain information
 */
export function useChainInfo() {
  const { chainType } = useMultiChain();

  const chainInfoMap = {
    evm: {
      name: 'Ethereum',
      displayName: 'Ethereum/EVM',
      color: 'purple',
      icon: '⟠',
      networks: ['Ethereum', 'Polygon', 'Arbitrum'],
    },
    solana: {
      name: 'Solana',
      displayName: 'Solana',
      color: 'green',
      icon: '◎',
      networks: ['Mainnet', 'Testnet', 'Devnet'],
    },
    bitcoin: {
      name: 'Bitcoin',
      displayName: 'Bitcoin',
      color: 'orange',
      icon: '₿',
      networks: ['Mainnet', 'Testnet'],
    },
  };

  return chainType ? chainInfoMap[chainType] : null;
}

/**
 * useAddressFormatter Hook
 * 
 * Utility for formatting addresses for display
 * Handles truncation and copying to clipboard
 * 
 * @param address - Address to format
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns {Object} Formatted address and copy utilities
 */
export function useAddressFormatter(address?: string, chars = 4) {
  const [copied, setCopied] = useState(false);

  const formatted = address
    ? `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
    : '';

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return {
    formatted,
    full: address,
    copied,
    copy: handleCopy,
  };
}

/**
 * useChainSwitcher Hook
 * 
 * Utilities for switching between chains
 * Works across all supported chains
 * 
 * @returns {Object} Chain switching utilities
 */
export function useChainSwitcher() {
  const { chainType } = useMultiChain();
  const [switching, setSwitching] = useState(false);

  const canSwitch = chainType !== null;

  const switchChain = async (targetChain: ChainType) => {
    if (targetChain === chainType) {
      console.log('Already connected to', targetChain);
      return;
    }

    setSwitching(true);
    try {
      // AppKit modal handles chain switching automatically
      // User can switch via the modal UI
      console.log('Please use wallet modal to switch to', targetChain);
    } finally {
      setSwitching(false);
    }
  };

  return {
    currentChain: chainType,
    canSwitch,
    switching,
    switchChain,
    availableChains: ['evm', 'solana', 'bitcoin'] as const,
  };
}