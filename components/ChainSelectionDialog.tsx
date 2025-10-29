"use client"

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Wallet, X } from 'lucide-react';

// Chain icons as SVG components for better quality
const EthereumIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
        <path d="M16.498 4L9 16.22l7.498-3.35z"/>
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
        <path d="M16.498 27.995v-6.028L9 17.616z"/>
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
      </g>
    </g>
  </svg>
);

const SolanaIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <defs>
      <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3"/>
        <stop offset="100%" stopColor="#DC1FFF"/>
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="16" fill="url(#solana-gradient)"/>
    <g fill="#FFF">
      <path d="M10.5 20.5l1.5-1.5h10l-1.5 1.5z"/>
      <path d="M10.5 16l1.5-1.5h10L20.5 16z"/>
      <path d="M10.5 11.5l1.5-1.5h10l-1.5 1.5z"/>
    </g>
  </svg>
);

const BitcoinIcon = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path fill="#FFF" fillRule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
    </g>
  </svg>
);

interface ChainSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChainSelect: (chain: 'ethereum' | 'solana' | 'bitcoin') => void;
}

export function ChainSelectionDialog({ open, onOpenChange, onChainSelect }: ChainSelectionDialogProps) {
  const chains = [
    {
      id: 'ethereum' as const,
      name: 'Ethereum',
      description: 'EVM-compatible chains',
      icon: <EthereumIcon />,
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
    },
    {
      id: 'solana' as const,
      name: 'Solana',
      description: 'High-speed blockchain',
      icon: <SolanaIcon />,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
    },
    {
      id: 'bitcoin' as const,
      name: 'Bitcoin',
      description: 'Original cryptocurrency',
      icon: <BitcoinIcon />,
      gradient: 'from-orange-500 to-yellow-600',
      hoverGradient: 'hover:from-orange-600 hover:to-yellow-700',
    },
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="sm:max-w-[500px] bg-glass backdrop-blur-xl border-glass animate-in fade-in-0 zoom-in-95 duration-200"
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        {/* Close button */}
        {/* <AlertDialogCancel className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground border-0 bg-transparent p-1 h-auto">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </AlertDialogCancel> */}

        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Select Blockchain
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Choose which blockchain network you want to connect to
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-4">
          {chains.map((chain, index) => (
            <button
              key={chain.id}
              onClick={() => {
                onChainSelect(chain.id);
                onOpenChange(false);
              }}
              className={`group relative p-4 rounded-xl border border-glass bg-glass hover-glass transition-all hover:scale-[1.02] hover:shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Chain Icon */}
                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${chain.gradient} p-0.5 shrink-0 transition-transform group-hover:scale-110`}>
                  <div className="w-full h-full rounded-[10px] bg-background/90 backdrop-blur-sm flex items-center justify-center p-2">
                    {chain.icon}
                  </div>
                </div>

                {/* Chain Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-theme mb-0.5">
                    {chain.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {chain.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-muted-foreground group-hover:text-theme transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 rounded-xl bg-linear-to-br ${chain.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
            </button>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 animate-in fade-in-0 duration-500" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-2 items-start">
            <Wallet className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your wallet connection is secure and read-only. We never access your private keys.
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center pt-2 animate-in fade-in-0 duration-500" style={{ animationDelay: '400ms' }}>
          <AlertDialogCancel className="px-6 py-2 rounded-xl bg-glass border border-glass hover-glass transition-all hover:scale-[1.02]">
            Cancel
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
