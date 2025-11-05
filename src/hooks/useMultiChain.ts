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

  // Use connected address with fallback
  const address = evmAddress || appKitAddress;
  
  // Check connection status from both sources
  // AppKit handles Solana and Bitcoin, Wagmi handles EVM
  const isConnected = isEvmConnected || isAppKitConnected || !!appKitAddress;
  const isLoading = isConnecting || isReconnecting || !mounted;
  
  // Detect chain type from multiple sources
  let chainType: ChainType | null = null;
  
  // Detect from CAIP address (most reliable for Solana/Bitcoin)
  if (caipAddress && typeof caipAddress === 'string') {
    if (caipAddress.startsWith('solana:')) {
      chainType = 'solana';
    } else if (caipAddress.startsWith('bip122:')) {
      chainType = 'bitcoin';
    } else if (caipAddress.startsWith('eip155:')) {
      chainType = 'evm';
    }
  }
  
  // Fallback to address-based detection
  if (!chainType && address) {
    chainType = getChainType(address);
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