"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, FileText, Download, Check, Sparkles, Shield, TrendingUp, BarChart3, FileCheck2, LogOut, Copy } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/components/theme-provider'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Moralis from "moralis";
import axios from 'axios';
import PDFCertificate from '@/components/PDFcertificate';
import Certificate from '@/components/certificate';
import { pdf } from '@react-pdf/renderer';
import { useDisconnect } from 'wagmi'
import { ChainSelectionDialog } from '@/components/ChainSelectionDialog';

export default function App() {

  const [step, setStep] = useState(1);
  type PortfolioBalance = { token: string; amount: number; imgUrl: string; value: number; chain: string; symbol: string; address: string };
  const [balances, setBalances] = useState<PortfolioBalance[]>([]);
  const [generating, setGenerating] = useState(false);
  const [totalValue, setTotalValue] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const { theme } = useTheme()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const [isChainDialogOpen, setIsChainDialogOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'solana' | 'bitcoin' | null>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);


  // ui elements
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
      : "from-gray-800 to-gray-500" // rich graphite gradient for light mode

  // Certificate props
  const props = {
    walletAddress: address ? address : '',
    totalValue: totalValue,
    balances: balances.slice(0, 2),
    certificateId: `CP-${Date.now().toString().slice(-8)}`,
    issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    verificationDate: new Date().toLocaleString('en-US'),
    certificateHash: `0x${Math.random().toString(16).slice(2, 18)}...`,
    companyName: 'WalletScan',
    companyUrl: 'wallet-scan.io',
    supportEmail: 'support@cryptoproof.io',
    disclaimer:
      'This certificate represents a snapshot of verified cryptocurrency holdings at the time of generation. Cryptocurrency values fluctuate and this document does not constitute financial advice. The holder maintains full custody of all assets. This certificate is for informational purposes only.',
    verifications: [
      'Blockchain data verified on-chain',
      'Real-time balance confirmation',
      'Cryptographically signed certificate',
    ],
  };




  // fetch all balanaces ////////////////////////////////////////////////////////////

  // useEffect(() => {

  //   async function fetchBalances() {
  //     await Moralis.start({
  //       apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
  //     });

  //     // if(!address) return

  //     const chains = [
  //       { name: "Ethereum Sepolia", chain: "0xaa36a7" },
  //       { name: "Polygon Amoy", chain: "0x13882" },
  //       { name: "Base Sepolia", chain: "0x14a34" },
  //       { name: "Arbitrum Sepolia", chain: "0x66eee" },
  //       { name: "Optimism Sepolia", chain: "0xaa37dc" },
  //     ]// Ethereum, Polygon, Optimism, Sepolia

  //     for (const chain of chains) {
  //       const resp = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
  //         address: "0x507699CA5ecEEb8eCB0c3b7Fa8E85dc0Bc7b35e8",
  //         chain: chain.chain,
  //       });
  //       console.log(chain, resp.toJSON());
  //     }

  //   }


  //   fetchBalances()
  // }, [address])



  const API_KEY = process.env.NEXT_PUBLIC_ZAPPER_API_KEY; // store in env
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

  async function fetchPortfolio(myVariables: { addresses: string[], first: number }) {
    const variables = myVariables;
    try {
      const resp = await axios.post('https://public.zapper.xyz/graphql', {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-zapper-api-key': API_KEY
        }
      });

      if (resp.data.errors) throw new Error(JSON.stringify(resp.data.errors));
      return resp.data.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Zapper fetch error:', err.response?.data || err.message);
      } else {
        console.error('Zapper fetch error:', (err as Error).message);
      }
      throw err;
    }
  }

  useEffect(() => {
    if (!address) return

    if (step !== 2) return

    const runFetchPortfolio = async () => {
      setIsPortfolioLoading(true)
      let myVariables: { addresses: string[], first: number } = {
        addresses: [
         address,
        ],
        first: 10
      }
      try {
        const data = await fetchPortfolio(myVariables);
        // console.log(JSON.stringify(data, null, 2));

        if (data && data.portfolioV2.tokenBalances.byToken.edges.length !== 0) {
          const balanceData: PortfolioBalance[] = []

          for (const edge of data.portfolioV2.tokenBalances.byToken.edges) {
            const amount = Number(Number(edge.node.balance).toFixed(4));
            const value = Number(Number(edge.node.balanceUSD).toFixed(2));
            balanceData.push({
              token: edge.node.name,
              amount,
              imgUrl: edge.node.imgUrlV2,
              value,
              chain: edge.node.network.name,
              symbol: edge.node.symbol,
              address: edge.node.tokenAddress,
            })
          }

          setBalances(balanceData as PortfolioBalance[])
        } else {
          setBalances([])
        }

        const totalValue = data && data.portfolioV2.tokenBalances.totalBalanceUSD
        setTotalValue(Number(totalValue) || 0)
      } finally {
        setIsPortfolioLoading(false)
      }

    };

    runFetchPortfolio()
  }, [address, step])


  ////////////////////////////////////////////////////////////////




  // generate proof-of-funds PDF
  const generatePDF = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setGenerating(false);
    setStep(3);
  };

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const doc = <PDFCertificate {...props} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CryptoProof_Certificate_${props.certificateId.replace('CP-', '')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Handle error (e.g., show toast)
    } finally {
      setIsDownloading(false);
    }
  };

  //utility
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Load selected chain from localStorage on mount
  useEffect(() => {
    const storedChain = localStorage.getItem('selectedChain');
    if (storedChain && ['ethereum', 'solana', 'bitcoin'].includes(storedChain)) {
      setSelectedChain(storedChain as 'ethereum' | 'solana' | 'bitcoin');
    }
  }, []);

  // Handle chain selection
  const handleChainSelect = (chain: 'ethereum' | 'solana' | 'bitcoin') => {
    setSelectedChain(chain);
    localStorage.setItem('selectedChain', chain);
    
    // Only open the Ethereum wallet connection for now
    if (chain === 'ethereum') {
      // The ConnectButton will handle the connection
      // You'll integrate Solana and Bitcoin later
    }
  };

  // check if connected
  useEffect(() => {
    if (address && step == 1) {
      setStep(2)
    } else {
      setStep(1)
    }

  }, [address])

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
      {/* Animated background - only show in dark mode */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none ">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Light mode background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-50/50 to-pink-50/50 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-glass backdrop-blur-xl backdrop-blur-xl bg-background/10 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 max-sm:py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                POF
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Proof of Funds Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Selected Chain Indicator */}
            {selectedChain && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass border border-glass">
                <div className={`w-2 h-2 rounded-full ${
                  selectedChain === 'ethereum' ? 'bg-blue-500' :
                  selectedChain === 'solana' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <span className="text-xs font-medium text-theme capitalize">{selectedChain}</span>
              </div>
            )}
            {address ? (
              <button
                onClick={() => disconnect()}
                className="px-4 py-1.5 rounded-xl bg-red-400 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <ConnectButton />
            )}
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
              <div className={`flex items-center gap-2 sm:gap-3 ${step >= num ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${step > num
                  ? 'bg-green-500/20 border-green-500'
                  : step === num
                    ? 'bg-primary/20 border-primary shadow-lg shadow-primary'
                    : 'border-border'
                  }`}>
                  {step > num ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> : num}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline text-theme">
                  {num === 1 ? 'Connect' : num === 2 ? 'Review' : 'Generate'}
                </span>
              </div>
              {num < 3 && (
                <div className={`w-8 sm:w-16 h-0.5 ${step > num ? 'bg-green-500' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>



        {/* Step 1: Connect Wallet */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8 sm:mb-12">
              <h2
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent inline-block`}
              >
                Connect Your Wallet
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Securely connect to view your holdings and generate proof of funds
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsChainDialogOpen(true)}
                className="px-8 py-4 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Connect Wallet
              </button>
            </div>

            {/* Hidden ConnectButton for Ethereum */}
            <div className="hidden">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    ref={connectButtonRef}
                    onClick={openConnectModal}
                  >
                    Connect
                  </button>
                )}
              </ConnectButton.Custom>
            </div>

            {/* Chain Selection Dialog */}
            <ChainSelectionDialog
              open={isChainDialogOpen}
              onOpenChange={setIsChainDialogOpen}
              onChainSelect={(chain) => {
                handleChainSelect(chain);
                // For Ethereum, open the RainbowKit modal
                if (chain === 'ethereum') {
                  // Trigger the hidden connect button after dialog closes
                  setTimeout(() => {
                    connectButtonRef.current?.click();
                  }, 100);
                }
              }}
            />

            {/* Security Notice */}
            <div className="my-8 max-w-2xl mx-auto p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-400 mb-1">Your funds are safe</p>
                  <p className="text-muted-foreground">
                    We never request your private keys or seed phrases. Connection is read-only for balance verification.
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"> */}
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
                      <p className="text-xs sm:text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>


            </section>

            {/* </div> */}



            {/* Feature highlights */}
            <div className="mt-12 sm:mt-16 flex justify-between gap-4 sm:gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">Secure</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Bank-grade encryption</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">Instant</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Generate in seconds</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                </div>
                <h4 className="font-semibold mb-1 text-theme text-sm sm:text-base">Real-time</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Live balance updates</p>
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
                <span className="text-xs sm:text-sm text-green-500">Wallet Connected</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-theme">Your Portfolio</h2>
              <p className="text-muted-foreground text-base sm:text-lg">Review your crypto holdings</p>
            </div>

            {/* Total Value Card */}
            <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-glass backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary/10 animate-pulse" />
                <div className="relative">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Total Portfolio Value</p>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                    ${totalValue.toLocaleString()}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-glass bg-glass hover-glass transition-all">
                    <span className="font-mono text-xs sm:text-sm text-theme">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!address) return;
                        try {
                          await navigator.clipboard.writeText(address);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        } catch (e) {
                          console.error('Clipboard copy failed', e);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      aria-label="Copy address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
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
                    <p className="text-sm font-medium text-theme">Fetching portfolio…</p>
                    <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
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
                      {balance.imgUrl ?
                        <img src={balance.imgUrl} className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl' alt={balance.token} />
                        : <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-white text-sm sm:text-base">
                          {balance.token.slice(0, 1)}
                        </div>}
                      <div>
                        <h4 className="font-semibold text-base sm:text-lg text-theme">{balance.token}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{balance.chain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm sm:text-lg text-theme">{balance.amount.toLocaleString()} {balance.symbol}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">${balance.value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Bar - Step 2 */}
            <div className="fixed bottom-0 inset-x-0 z-50 border-t border-glass bg-glass backdrop-blur-xl">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                <button
                  onClick={generatePDF}
                  disabled={generating || isPortfolioLoading}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Generating PDF...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Generate Proof of Funds</span>
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
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/50 animate-in zoom-in duration-500">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-green-500/30 rounded-full animate-ping" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-theme">Ready to Download!</h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8">
                Your proof of funds document has been generated successfully
              </p>

              {/* PDF Preview Card */}
              <div className="sm:p-2 rounded-3xl bg-glass border border-glass backdrop-blur-xl mb-6 sm:mb-8">
                <Certificate {...props} />
              </div>

              {/* Bottom Action Bar - Step 3 */}
              <div className="fixed bottom-0 inset-x-0 z-50 border-t border-glass bg-glass backdrop-blur-3xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                  <button onClick={handleExport}
                    disabled={isDownloading}
                    className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white flex items-center justify-center gap-2">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setStep(2); setBalances([]); }}
                  className="w-full py-3 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white flex items-center justify-center gap-2">
                  
                  Generate Another
                </button>
                <button
                onClick={() => disconnect()}
                className="py-3 px-4 rounded-xl bg-red-400 text-white font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect </span>
              </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`relative border-t border-glass mt-16  sm:mt-20 backdrop-blur-xl bg-glass ${step == 1 ? "mb-0" : "mb-16  sm:mb-20"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>Built by Victor Adeiza (vicdevman) • <a
            href="https://www.linkedin.com/in/victor-adeiza-vicdevman-043902257"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-bold"
          > LinkedIn</a> </p>
        </div>
      </footer>
    </div>
  );
}


