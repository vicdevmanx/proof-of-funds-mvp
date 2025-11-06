// hooks/useMultiChain.ts
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
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
  const { address: appKitAddress, isConnected: isAppKitConnected, caipAddress } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let address: string | undefined;
  let chainType: ChainType | null = null;
  let isConnected = false;

  // Prioritize AppKit for non-EVM chains
  if (isAppKitConnected && appKitAddress) {
    if (caipAddress?.startsWith('solana:')) {
      chainType = 'solana';
      address = appKitAddress;
      isConnected = true;
    } else if (caipAddress?.startsWith('bip122:')) {
      chainType = 'bitcoin';
      address = appKitAddress;
      isConnected = true;
    }
  }

  // Fallback to EVM if AppKit is not connected for a non-EVM chain
  if (!isConnected && isEvmConnected && evmAddress) {
    chainType = 'evm';
    address = evmAddress;
    isConnected = true;
  }

  const isLoading = isConnecting || isReconnecting || !mounted;

  // If no wallet is connected, ensure all state is cleared
  if (!isEvmConnected && !isAppKitConnected) {
    address = undefined;
    chainType = null;
    isConnected = false;
  }

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