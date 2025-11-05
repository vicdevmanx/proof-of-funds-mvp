// app/(main)/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  useDisconnect as useAppKitDisconnect,
} from "@reown/appkit/react";
import { useDisconnect } from "wagmi";
import { useMultiChain } from "@/hooks/useMultiChain";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import PDFCertificate from "@/components/PDFcertificate";
import { pdf } from "@react-pdf/renderer";
import type { PortfolioBalance } from "@/types";
import { usePortfolio } from "@/hooks/usePortfolio";
import QRCode from "qrcode";
import { toast } from "sonner";

import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { ConnectWalletStep } from "./components/ConnectWalletStep";
import { ReviewBalancesStep } from "./components/ReviewBalancesStep";
import { GenerateCertificateStep } from "./components/GenerateCertificateStep";

export default function App() {
  const BALANCES_TO_DISPLAY = 2;

  const [step, setStep] = useState(1);
  const [balances, setBalances] = useState<PortfolioBalance[]>([]);
  const [generating, setGenerating] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [certId, setCertId] = useState<string | null>(null);

  const { theme } = useTheme();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { disconnect: disconnectAppKit } = useAppKitDisconnect();
  const { address, isConnected, chainType } = useMultiChain();
  const { data: portfolioData, isLoading: isPortfolioLoading } = usePortfolio(chainType, address);

  const gradientClass =
    theme === "dark" ? "from-white to-gray-400" : "from-gray-800 to-gray-500";

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
    holderName: name || "Anonymous Holder",
  };

  useEffect(() => {
    if (portfolioData) {
      setBalances(portfolioData.balances);
      setTotalValue(portfolioData.totalValue);
    }
  }, [portfolioData]);

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
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setCertId(data.certificateId);
        toast.success("Certificate generated successfully!", { id: "generate-cert" });
      } else {
        toast.error("Failed to generate certificate", { id: "generate-cert" });
      }
    } catch (error) {
      toast.error("An error occurred while generating certificate", { id: "generate-cert" });
    } finally {
      setGenerating(false);
      setStep(3);
    }
  };

  const handleExport = async () => {
    setIsDownloading(true);
    toast.loading("Preparing PDF download...", { id: "pdf-download" });
    try {
      const qrUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      }/verify/${certificateProps.certificateId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, { width: 256, margin: 2 });
      const doc = (
        <PDFCertificate {...certificateProps} qrCodeDataUrl={qrCodeDataUrl} />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `walletScan_Certificate_${certificateProps.certificateId.replace("CP-","")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully!", { id: "pdf-download" });
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-download" });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
      setName("");
    }
  }, [isConnected, address, step]);

  return (
    <div className="min-h-screen bg-theme text-theme transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-cyan-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-cyan-50/50 to-pink-50/50 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28">
        <ProgressBar step={step} />

        {step === 1 && <ConnectWalletStep gradientClass={gradientClass} />}

        {step === 2 && (
          <ReviewBalancesStep
            address={address}
            totalValue={totalValue}
            balances={balances}
            isPortfolioLoading={isPortfolioLoading}
            generating={generating}
            name={name}
            setName={setName}
            nameError={nameError}
            generatePDF={generatePDF}
          />
        )}

        {step === 3 && (
          <GenerateCertificateStep
            certificateProps={certificateProps}
            isDownloading={isDownloading}
            handleExport={handleExport}
          />
        )}
      </main>

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
