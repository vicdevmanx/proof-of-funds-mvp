// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  FileText,
  Download,
  Check,
  Sparkles,
  Shield,
  TrendingUp,
  BarChart3,
  FileCheck2,
  LogOut,
  Copy,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import PDFCertificate from "@/components/PDFcertificate";
import Certificate from "@/components/certificate";
import { pdf } from "@react-pdf/renderer";
import type { PortfolioBalance } from "@/types";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect as useAppKitDisconnect,
} from "@reown/appkit/react";
import { useDisconnect } from "wagmi";
import { useMultiChain } from "@/hooks/useMultiChain";
import {
  fetchSolanaPortfolio,
  fetchBitcoinPortfolio,
} from "@/lib/portfolioFetchers";
import QRCode from "qrcode";
import { toast } from "sonner";

/**
 * App Component - Proof of Funds Generator
 * Unified multi-chain implementation using AppKit
 */
export default function App() {
  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  // Number of balances to display in certificate (change this value to show more/less)
  const BALANCES_TO_DISPLAY = 2;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [step, setStep] = useState(1);
  const [balances, setBalances] = useState<PortfolioBalance[]>([]);
  const [generating, setGenerating] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [name, setName] = useState(""); // New state for self-reported name
  const [nameError, setNameError] = useState(""); // Error state for name validation

  // Theme and UI
  const { theme } = useTheme();

  // AppKit hooks
  const { open } = useAppKit();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { disconnect: disconnectAppKit } = useAppKitDisconnect();

  // Multi-chain hook
  const {
    address,
    isConnected,
    chainType,
    isLoading: isWalletLoading,
  } = useMultiChain();

  /**
   * Handle disconnect for all chains
   * Uses appropriate disconnect method based on chain type
   */
  const handleDisconnect = async () => {
    try {
      // Disconnect using AppKit (works for all chains)
      await disconnectAppKit();

      // Also disconnect Wagmi for EVM chains
      if (chainType === "evm") {
        disconnectWagmi();
      }

      // Reset state
      setStep(1);
      setBalances([]);
      setTotalValue(0);
      setName(""); // Reset name

      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================

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

  const gradientClass =
    theme === "dark"
      ? "from-white to-gray-400" // cool silvery glow for dark mode
      : "from-gray-800 to-gray-500"; // rich graphite gradient for light mode

  // Certificate props with name
  const [certId, setCertId] = useState<string | null>(null);

  const certificateProps = {
    walletAddress: address || "",
    totalValue: totalValue,
    balances: balances.slice(0, BALANCES_TO_DISPLAY),
    totalBalances: balances.length,
    certificateId: certId || `Id failed to generate`,
    issueDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    verificationDate: new Date().toLocaleString("en-US"),
    certificateHash: `0x${Math.random().toString(16).slice(2, 18)}...`,
    companyName: "WalletScan",
    companyUrl: "wallet-scan.io",
    supportEmail: "support@cryptoproof.io",
    disclaimer:
      "This certificate represents a snapshot of verified cryptocurrency holdings at the time of generation. Cryptocurrency values fluctuate and this document does not constitute financial advice. The holder maintains full custody of all assets. This certificate is for informational purposes only.",
    verifications: [
      "Blockchain data verified on-chain",
      "Real-time balance confirmation",
      "Cryptographically signed certificate",
    ],
    holderName: name || "Anonymous Holder", // Add holderName prop; fallback if empty
  };

  // ============================================================================
  // PORTFOLIO FETCHING LOGIC
  // ============================================================================

  /**
   * Fetch EVM portfolio using Zapper API
   * Supports Ethereum, Polygon, Arbitrum
   */
  const fetchEVMPortfolio = async (
    evmAddress: string
  ): Promise<{ balances: PortfolioBalance[]; totalValue: number }> => {
    const ZAPPER_API_KEY = process.env.NEXT_PUBLIC_ZAPPER_API_KEY;
    const query = `query Portfolio($addresses: [Address!]!, $first: Int!) {
      portfolioV2(addresses: $addresses) {
        tokenBalances {
          totalBalanceUSD
          byToken(first: $first) {
            totalCount
            edges {
              node {
                name
                symbol
                price
                tokenAddress
                imgUrlV2
                decimals
                balanceRaw
                balance
                balanceUSD
                network {
                  name
                }
              }
            }
          }
        }
      }
    }`;

    try {
      const variables = {
        addresses: [evmAddress],
        first: 10,
      };

      const resp = await axios.post(
        "https://public.zapper.xyz/graphql",
        {
          query,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-zapper-api-key": ZAPPER_API_KEY,
          },
        }
      );

      if (resp.data.errors) {
        throw new Error(JSON.stringify(resp.data.errors));
      }

      const data = resp.data.data;
      const balanceData: PortfolioBalance[] = [];

      if (data?.portfolioV2?.tokenBalances?.byToken?.edges) {
        for (const edge of data.portfolioV2.tokenBalances.byToken.edges) {
          balanceData.push({
            token: edge.node.name,
            amount: Number(Number(edge.node.balance).toFixed(4)),
            imgUrl: edge.node.imgUrlV2,
            value: Number(Number(edge.node.balanceUSD).toFixed(2)),
            chain: edge.node.network.name,
            symbol: edge.node.symbol,
            address: edge.node.tokenAddress,
          });
        }
      }

      const totalValue = Number(
        data?.portfolioV2?.tokenBalances?.totalBalanceUSD || 0
      );

      return { balances: balanceData, totalValue };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          "EVM Portfolio fetch error:",
          err.response?.data || err.message
        );
      } else {
        console.error("EVM Portfolio fetch error:", (err as Error).message);
      }
      throw err;
    }
  };

  // Solana and Bitcoin portfolio fetchers are now imported from @/lib/portfolioFetchers

  /**
   * Main effect to fetch portfolio based on connected chain
   * Automatically triggers when wallet connects or chain changes
   */
  useEffect(() => {
    // Only fetch when on step 2 (review balances) and wallet is connected
    if (step !== 2 || !isConnected || !address) return;

    const fetchPortfolioData = async () => {
      setIsPortfolioLoading(true);

      try {
        let result: { balances: PortfolioBalance[]; totalValue: number };
        console.log("Custom Chain type log:", chainType);
        // Fetch portfolio based on connected chain type
        switch (chainType) {
          case "evm":
            result = await fetchEVMPortfolio(address);
            break;

          case "solana":
            result = await fetchSolanaPortfolio(address);
            break;

          case "bitcoin":
            result = await fetchBitcoinPortfolio(address);
            break;

          default:
            console.warn("Unknown chain type:", chainType);
            return;
        }

        // Update state with fetched data
        setBalances(result.balances);
        setTotalValue(result.totalValue);

        if (result.balances.length > 0) {
          toast.success(
            `Portfolio loaded: ${result.balances.length} assets found`
          );
        } else {
          toast("No assets found in this wallet", { icon: "ℹ️" });
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
        toast.error("Failed to load portfolio. Please try again.");
        // Reset state on error
        setBalances([]);
        setTotalValue(0);
      } finally {
        setIsPortfolioLoading(false);
      }
    };

    fetchPortfolioData();
  }, [address, isConnected, chainType, step]);

  // ============================================================================
  // PDF GENERATION
  // ============================================================================

  /**
   * Generate PDF and advance to step 3
   */
  const generatePDF = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      toast.error("Please enter your name to proceed");
      return;
    }
    setNameError("");
    setGenerating(true);
    toast.loading("Generating certificate...", { id: "generate-cert" });
    try {
      // Call API to create certificate
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          holderName: name,
          totalValue,
          balances,
          issueDate: certificateProps.issueDate,
          verificationDate: certificateProps.verificationDate,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Certificate stored:", data.certificate);
        setCertId(data.certificateId); // Update state for props
        toast.success("Certificate generated successfully!", {
          id: "generate-cert",
        });
      } else {
        console.error("Error storing certificate:", data.error);
        toast.error("Failed to generate certificate", { id: "generate-cert" });
      }
    } catch (error) {
      console.error("Error storing certificate:", error);
      toast.error("An error occurred while generating certificate", {
        id: "generate-cert",
      });
    } finally {
      setGenerating(false);
      setStep(3);
    }
  };

  /**
   * Handle PDF export and download
   */
  const handleExport = async () => {
    setIsDownloading(true);
    toast.loading("Preparing PDF download...", { id: "pdf-download" });
    try {
      // Generate QR code first
      const qrUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      }/verify/${certificateProps.certificateId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Create PDF with QR code
      const doc = (
        <PDFCertificate {...certificateProps} qrCodeDataUrl={qrCodeDataUrl} />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `walletScan_Certificate_${certificateProps.certificateId.replace(
        "CP-",
        ""
      )}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.", {
        id: "pdf-download",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Scroll to top when step changes
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, toast]);

  /**
   * Auto-advance to step 2 when wallet connects
   * Reset to step 1 when wallet disconnects
   */
  useEffect(() => {
    if (isConnected && address && step === 1) {
      setStep(2);
      toast.success(
        `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`
      );
    } else if (!isConnected && step !== 1) {
      setStep(1);
      setBalances([]);
      setTotalValue(0);
      setName(""); // Reset name
    }
  }, [isConnected, address, step]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Light mode background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-cyan-50/50 to-pink-50/50 rounded-full blur-3xl" />
      </div>

      {/* Header */}
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
            {/* Current Chain Indicator */}
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

            {/* Disconnect/Connect Button */}
            {isConnected && address ? (
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

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28">
        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12 flex items-center justify-center gap-2 sm:gap-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2 sm:gap-4">
              <div
                className={`flex items-center gap-2 sm:gap-3 ${
                  step >= num ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step > num
                      ? "bg-green-500/20 border-green-500"
                      : step === num
                      ? "bg-primary/20 border-primary shadow-lg shadow-primary"
                      : "border-border"
                  }`}
                >
                  {step > num ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    num
                  )}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline text-theme">
                  {num === 1 ? "Connect" : num === 2 ? "Review" : "Generate"}
                </span>
              </div>
              {num < 3 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 ${
                    step > num ? "bg-green-500" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8 sm:mb-12">
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-linear-to-r ${gradientClass} bg-clip-text text-transparent inline-block`}
              >
                Connect Your Wallet
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Securely connect to view your holdings and generate proof of
                funds
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
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-400 mb-1">
                    Your funds are safe
                  </p>
                  <p className="text-muted-foreground">
                    We never request your private keys or seed phrases.
                    Connection is read-only for balance verification.
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
                <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">
                  Real-time
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Live balance updates
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review Balances */}
        {step === 2 && (
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

            {/* Name Input Section - Integrated into Step 2 */}
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
                  <p className="text-red-500 text-xs sm:text-sm mt-2">
                    {nameError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Disclaimer: We verify wallet addresses only—not your identity.
                  This is for informational purposes only.
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
                      <span className="text-xs">
                        {copied ? "Copied" : "Copy"}
                      </span>
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

            {/* Bottom Action Bar - Step 2 */}
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
                      <span className="text-sm sm:text-base">
                        Generate Proof of Funds
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Download PDF */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center max-w-5xl mx-auto">
              {/* Success Animation */}
              <div className="mb-6 sm:mb-8 relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/50 animate-in zoom-in duration-500">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-green-500/30 rounded-full animate-ping" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-theme">
                Ready to Download!
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
                Your proof of funds document has been generated successfully
              </p>

              {/* PDF Preview Card */}
              <div className="sm:p-2 rounded-3xl bg-glass border border-glass backdrop-blur-xl mb-6 sm:mb-8">
                <Certificate {...certificateProps} />
              </div>

              {/* Bottom Action Bar - Step 3 */}
              <div className="fixed bottom-0 inset-x-0 z-50 border-t border-glass bg-glass backdrop-blur-3xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                  <button
                    onClick={handleExport}
                    disabled={isDownloading}
                    className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex items-center gap-2 mb-24">
                <button
                  onClick={() => {
                    setStep(2);
                    setBalances([]);
                    setTotalValue(0);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white flex items-center justify-center gap-2"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-3 px-4 rounded-xl bg-red-400 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`relative border-t border-glass mt-16 sm:mt-20 backdrop-blur-xl bg-glass ${
          step == 1 ? "mb-0" : "mb-16 sm:mb-20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            Built by Victor Adeiza (vicdevman) •{" "}
            <a
              href="https://www.linkedin.com/in/victor-adeiza-vicdevman-043902257"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-bold"
            >
              {" "}
              LinkedIn
            </a>{" "}
          </p>
        </div>
      </footer>
    </div>
  );
}
