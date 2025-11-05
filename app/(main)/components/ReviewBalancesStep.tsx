"use client";

import React from "react";
import { Check, Copy, FileText } from "lucide-react";
import { PortfolioBalance } from "@/types";
import { toast } from "sonner";

interface ReviewBalancesStepProps {
  address: string | null | undefined;
  totalValue: number;
  balances: PortfolioBalance[];
  isPortfolioLoading: boolean;
  generating: boolean;
  name: string;
  setName: (name: string) => void;
  nameError: string;
  generatePDF: () => void;
}

export function ReviewBalancesStep({
  address,
  totalValue,
  balances,
  isPortfolioLoading,
  generating,
  name,
  setName,
  nameError,
  generatePDF,
}: ReviewBalancesStepProps) {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
          <span className="text-xs sm:text-sm text-green-500">
            Wallet Connected
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-theme">
          Your Portfolio
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Review your crypto holdings
        </p>
      </div>

      {/* Name Input Section */}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
        <div className="p-4 sm:p-6 rounded-2xl bg-glass border border-glass backdrop-blur-xl">
          <label className="block text-sm sm:text-base font-medium text-theme mb-2">
            Enter Your Name (Self-Reported)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            className="w-full p-3 sm:p-4 rounded-xl bg-glass border border-glass focus:border-primary focus:outline-none text-theme placeholder-muted-foreground"
          />
          {nameError && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">{nameError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Disclaimer: We verify wallet addresses only—not your identity. This
            is for informational purposes only.
          </p>
        </div>
      </div>

      {/* Total Value Card */}
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-glass backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary/10 animate-pulse" />
          <div className="relative">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Total Portfolio Value
            </p>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
              ${totalValue.toLocaleString()}
            </h3>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-glass bg-glass hover-glass transition-all">
              <span className="font-mono text-xs sm:text-sm text-theme">
                {address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : "Not connected"}
              </span>
              <button
                type="button"
                onClick={async () => {
                  if (!address) return;
                  try {
                    await navigator.clipboard.writeText(address);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                    toast.success("Address copied to clipboard!");
                  } catch (e) {
                    console.error("Clipboard copy failed", e);
                    toast.error("Failed to copy address");
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                aria-label="Copy address"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loader */}
      {isPortfolioLoading && (
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="p-6 rounded-2xl border border-glass bg-glass backdrop-blur-xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div>
              <p className="text-sm font-medium text-theme">
                Fetching portfolio…
              </p>
              <p className="text-xs text-muted-foreground">
                This usually takes a few seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {balances.map((balance, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-6 rounded-2xl bg-glass border border-glass backdrop-blur-xl hover-glass transition-all"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {balance.imgUrl ? (
                  <img
                    src={balance.imgUrl}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
                    alt={balance.token}
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-white text-sm sm:text-base">
                    {balance.token.slice(0, 1)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-base sm:text-lg text-theme">
                    {balance.token}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {balance.chain}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm sm:text-lg text-theme">
                  {balance.amount.toLocaleString()} {balance.symbol}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ${balance.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-glass bg-glass backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              generatePDF();
            }}
            disabled={generating || isPortfolioLoading}
            className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm sm:text-base">
                  Generating PDF...
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Generate Certificate</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
