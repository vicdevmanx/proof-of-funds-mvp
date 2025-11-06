"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PDFCertificate from "@/components/PDFcertificate";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { Download, Loader2 } from "lucide-react";

export default function DownloadPage() {
  const params = useParams();
  const certId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Auto-download on page load
    handleDownload();
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setDownloading(true);
    try {
      // Fetch certificate data
      const response = await fetch(`/api/download-certificate?id=${certId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError("Certificate not found");
        setLoading(false);
        setDownloading(false);
        return;
      }

      const cert = data.certificate;

      // Generate QR code
      const qrUrl = `${window.location.origin}/verify/${certId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 2,
      });

      // Prepare certificate props
      const certificateProps = {
        walletAddress: cert.walletAddress,
        totalValue: cert.totalValue,
        balances: cert.balances.slice(0, 2),
        totalBalances: cert.balances.length,
        certificateId: cert.certificateId,
        issueDate: cert.issueDate,
        verificationDate: cert.verificationDate,
        certificateHash: cert.certificateHash,
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
        holderName: cert.holderName,
      };

      // Generate PDF
      const doc = (
        <PDFCertificate {...certificateProps} qrCodeDataUrl={qrCodeDataUrl} />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `walletScan_Certificate_${certId.replace("CP-", "")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setLoading(false);
      setDownloading(false);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download certificate");
      setLoading(false);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {loading ? (
          <>
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-theme">
                Preparing Your Certificate
              </h1>
              <p className="text-muted-foreground">
                Your download will start automatically...
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-4xl">❌</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-theme">Error</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:opacity-90 transition-all"
            >
              Go Home
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-4xl">✅</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-theme">
                Download Complete!
              </h1>
              <p className="text-muted-foreground">
                Your certificate has been downloaded.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Again</span>
                  </>
                )}
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full px-6 py-3 rounded-xl bg-glass border border-glass text-theme font-semibold hover:bg-glass/80 transition-all"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
