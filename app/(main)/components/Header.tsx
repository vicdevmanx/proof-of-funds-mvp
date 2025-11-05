"use client";

import { Shield, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppKit, useDisconnect as useAppKitDisconnect } from "@reown/appkit/react";
import { useDisconnect } from "wagmi";
import { useMultiChain } from "@/hooks/useMultiChain";
import { toast } from "sonner";

export function Header() {
  const { open } = useAppKit();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { disconnect: disconnectAppKit } = useAppKitDisconnect();
  const { isConnected, chainType } = useMultiChain();

  const handleDisconnect = async () => {
    try {
      await disconnectAppKit();
      if (chainType === "evm") {
        disconnectWagmi();
      }
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  return (
    <header className="relative border-b border-glass backdrop-blur-xl bg-background/10 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 max-sm:py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
              POF
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Proof of Funds Generator
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {isConnected && chainType && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass border border-glass">
              <div
                className={`w-2 h-2 rounded-full ${
                  chainType === "evm"
                    ? "bg-blue-500"
                    : chainType === "solana"
                    ? "bg-purple-500"
                    : "bg-orange-500"
                }`}
              />
              <span className="text-xs font-medium text-theme capitalize">
                {chainType}
              </span>
            </div>
          )}

          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-1.5 rounded-lg bg-red-400 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={() => open()}
              className="px-4 py-1.5 rounded-lg bg-blue-400 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
            >
              Connect Wallet
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
