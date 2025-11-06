// hooks/useUnifiedDisconnect.ts
'use client';

import { useDisconnect as useWagmiDisconnect } from 'wagmi';
import { useDisconnect as useAppKitDisconnect } from '@reown/appkit/react';
import { useMultiChain } from './useMultiChain';
import { toast } from 'sonner';

export function useUnifiedDisconnect() {
  const { disconnect: disconnectWagmi } = useWagmiDisconnect();
  const { disconnect: disconnectAppKit } = useAppKitDisconnect();
  const { chainType } = useMultiChain();

  const disconnect = async () => {
    try {
      // Disconnect from both providers
      await disconnectAppKit();
      disconnectWagmi();
      
      // Clear AppKit cache to prevent auto-reconnect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@appkit/identity_cache');
      }

      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  return { disconnect };
}
