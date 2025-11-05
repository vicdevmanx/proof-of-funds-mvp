"use client";

import { Wallet, BarChart3, FileCheck2, Shield, Sparkles, TrendingUp } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";

interface ConnectWalletStepProps {
  gradientClass: string;
}

const features = [
  {
    icon: <Wallet className="w-10 h-10 text-indigo-500 mb-4" />,
    title: "Connect Wallet",
    desc: "Securely link your crypto wallets to verify ownership.",
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-emerald-500 mb-4" />,
    title: "View Balances",
    desc: "Automatically pull your total holdings across chains.",
  },
  {
    icon: <FileCheck2 className="w-10 h-10 text-blue-500 mb-4" />,
    title: "Generate Proof",
    desc: "Download an official PDF with QR verification link.",
  },
];

export function ConnectWalletStep({ gradientClass }: ConnectWalletStepProps) {
  const { open } = useAppKit();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8 sm:mb-12">
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-linear-to-r ${gradientClass} bg-clip-text text-transparent inline-block`}
        >
          Connect Your Wallet
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Securely connect to view your holdings and generate proof of funds
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => open()}
          className="px-8 py-4 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition-all shadow-lg"
        >
          Connect Wallet
        </button>
      </div>

      {/* Security Notice */}
      <div className="my-8 max-w-2xl mx-auto p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-400 mb-1">
              Your funds are safe
            </p>
            <p className="text-muted-foreground">
              We never request your private keys or seed phrases. Connection is
              read-only for balance verification.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="w-full max-w-4xl mx-auto text-center py-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-glass bg-glass hover-glass transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl text-center"
            >
              <div className="flex flex-col items-center justify-center">
                {f.icon}
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-theme">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <div className="mt-12 sm:mt-16 flex justify-between gap-4 sm:gap-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">
            Secure
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bank-grade encryption
          </p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">
            Instant
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate in seconds
          </p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
          </div>
          <h4 className="font-semibold mb-1 text-theme text-sm sm:text-.base">
            Real-time
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live balance updates
          </p>
        </div>
      </div>
    </div>
  );
}
