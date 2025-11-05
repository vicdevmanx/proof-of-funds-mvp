// app/providers/MultiChainProvider.tsx
'use client';

import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { cookieToInitialState } from 'wagmi';
import {
  wagmiAdapter,
  queryClient,
  modal,
  projectId,
} from '@/lib/multichain';
import { useTheme } from '@/components/theme-provider';
import type { PropsWithChildren } from 'react';

/**
 * SSR Cookie Management
 * Only initialize on client side to avoid hydration mismatches
 */
const getInitialState = () => {
  if (typeof window === 'undefined') return undefined;
  return cookieToInitialState(
    wagmiAdapter.wagmiConfig as any,
    process.env.NEXT_PUBLIC_COOKIE
  );
};

interface MultiChainProviderProps extends PropsWithChildren {
  initialState?: ReturnType<typeof cookieToInitialState>;
}

/**
 * MultiChainProvider
 * 
 * Wraps the entire app with necessary Web3 providers:
 * - WagmiProvider: EVM blockchain interactions
 * - QueryClientProvider: React Query for state management
 * - Theme synchronization with AppKit modal
 * 
 * Usage: Wrap your app root with this provider
 * <MultiChainProvider>{children}</MultiChainProvider>
 */
export default function MultiChainProvider({
  children,
  initialState = getInitialState(),
}: MultiChainProviderProps) {
  const { theme } = useTheme();

  /**
   * Sync app theme with AppKit modal theme
   * Updates both theme mode and CSS variables
   */
  useEffect(() => {
    if (!modal) return;

    // Set theme mode
    modal.setThemeMode(theme as 'light' | 'dark');

    // Define theme variables based on current theme
    const themeVars = {
      light: {
        '--w3m-font-family':
          'var(--font-geist-sans), Arial, Helvetica, sans-serif',
        '--w3m-accent': '#3b82f6',
        '--w3m-color-mix': '#ffffff',
        '--w3m-color-mix-strength': 5,
        '--w3m-border-radius-master': '10px',
        '--w3m-gray-glass-010': 'rgba(255, 255, 255, 0.1)',
        '--w3m-gray-glass-025': 'rgba(255, 255, 255, 0.25)',
      },
      dark: {
        '--w3m-font-family':
          'var(--font-geist-sans), Arial, Helvetica, sans-serif',
        '--w3m-accent': '#3b82f6',
        '--w3m-color-mix': '#0a0a0a',
        '--w3m-color-mix-strength': 10,
        '--w3m-border-radius-master': '10px',
        '--w3m-gray-glass-010': 'rgba(10, 10, 10, 0.1)',
        '--w3m-gray-glass-025': 'rgba(10, 10, 10, 0.25)',
      },
    } as const;

    const currentThemeVars =
      theme === 'dark' ? themeVars.dark : themeVars.light;
    modal.setThemeVariables(currentThemeVars as any);
  }, [theme]);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as any}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}