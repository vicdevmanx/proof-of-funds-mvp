// lib/multichain.ts
'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin';
import {
  mainnet,
  polygon,
  arbitrum,
  sepolia,
  solana,
  solanaTestnet,
  bitcoin,
  bitcoinTestnet,
} from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';

/**
 * Project ID from Reown Dashboard
 * Get it at: https://cloud.reown.com
 */
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not defined');
}

/**
 * Query client for React Query
 * Used by Wagmi adapter for caching and state management
 */
export const queryClient = new QueryClient();

/**
 * Metadata for AppKit Modal display
 * Customize these values to match your app
 */
export const metadata = {
  name: 'WalletScan',
  description: 'Proof of Funds Generator - Multi-chain Wallet Integration',
  url: 'https://proof-of-funds-mvp.vercel.app/',
  icons: ['https://WalletScan.io/logo.png'],
};

/**
 * EVM Networks (Ethereum, Polygon, Arbitrum)
 * Configured via WagmiAdapter for all EVM interactions
 */
export const evmNetworks = [mainnet, polygon, arbitrum];

/**
 * Development/Testnet Networks
 * Include sepolia for testing before mainnet deployment
 */
export const testnetNetworks = [sepolia];

/**
 * All networks combined
 * Order matters - first network is the default
 */
export const allNetworks = [...evmNetworks, solana, bitcoin];

/**
 * EVM Adapter Configuration
 * Handles all Ethereum-compatible chain interactions
 */
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: evmNetworks,
  ssr: true, // Enable server-side rendering for Next.js
});

/**
 * Solana Adapter Configuration
 * Handles Solana blockchain interactions
 * Supports Phantom, Solflare, and other Solana wallets
 */
export const solanaAdapter = new SolanaAdapter({
  // Wallets will be auto-discovered from browser extensions
  wallets: [],
});

/**
 * Bitcoin Adapter Configuration
 * Handles Bitcoin blockchain interactions
 * Supports Unisat, Xverse, and other Bitcoin wallets
 */
export const bitcoinAdapter = new BitcoinAdapter({
  projectId,
  networks: [bitcoin],
});

/**
 * Featured Wallets Configuration
 * These wallets will appear at the top of the wallet list
 * Optimized for mobile with proper deep linking support
 * 
 * Mobile Behavior:
 * - MetaMask: Opens in-app browser with WalletConnect support
 * - Trust Wallet: Native deep linking with multi-chain support
 * - Phantom: Native Solana wallet with Ethereum support
 * - Coinbase Wallet: Native app integration
 * - Solflare: Solana-focused wallet with great mobile UX
 */
export const featuredWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask (EVM)
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet (Multi-chain)
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom (Solana + Ethereum)
  'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet (EVM)
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow (EVM)
  '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // Solflare (Solana)
  '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live (Multi-chain)
];

/**
 * AppKit Modal Instance
 * Single instance for entire app - manages all chain interactions
 * Do not create multiple instances
 */
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  networks: [mainnet, polygon, arbitrum, solana, bitcoin],
  metadata,
  projectId,
  
  // Feature Configuration
  features: {
    analytics: true, // Track user interactions
    email: false, // Disable email login for privacy
    socials: false, // Disable social logins
    emailShowWallets: false,
    allWallets: true, // Show all available wallets
  },
  
  // Featured wallets appear first
  featuredWalletIds,
  
  // Display all wallets only on mobile to prevent desktop duplication
  // Desktop: Shows only featured wallets (detected extensions still work)
  // Mobile: Shows all available wallets for better discovery
  allWallets: 'ONLY_MOBILE',
  
  // Enable wallet images for better UX
  enableWalletGuide: true,
  
  // Theme Configuration
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
    '--w3m-accent': '#3b82f6',
    '--w3m-color-mix': '#0a0a0a',
    '--w3m-color-mix-strength': 10,
    '--w3m-border-radius-master': '10px',
  },
});

/**
 * Chain-specific types and helpers
 */
export type ChainType = 'evm' | 'solana' | 'bitcoin';

export interface ChainConfig {
  type: ChainType;
  isConnected: boolean;
  address?: string;
}

/**
 * Detect which chain type a user is connected to
 * Useful for rendering chain-specific UI
 */
export const getChainType = (address?: string): ChainType | null => {
  if (!address) return null;
  
  // Bitcoin addresses start with 1, 3, or bc1
  if (/^[13]|^bc1/.test(address)) return 'bitcoin';
  
  // Solana addresses are 32-44 chars and use base58
  if (/^[1-9A-HJ-NP-Z]{32,44}$/.test(address)) return 'solana';
  
  // EVM addresses are 42 chars starting with 0x
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'evm';
  
  return null;
};