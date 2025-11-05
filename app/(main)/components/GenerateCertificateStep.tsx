"use client";

import { Check, Download } from "lucide-react";
import Certificate from "@/components/certificate";

interface GenerateCertificateStepProps {
  certificateProps: any;
  isDownloading: boolean;
  handleExport: () => void;
}

export function GenerateCertificateStep({
  certificateProps,
  isDownloading,
  handleExport,
}: GenerateCertificateStepProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center max-w-5xl mx-auto">
        {/* Success Animation */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-green-500/50 animate-in zoom-in duration-500">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-theme">
          Certificate Generated!
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-12">
          Your proof of funds is ready. Download it as a PDF below.
        </p>

        {/* Certificate Preview */}
        <div className="mb-8 sm:mb-12">
          <Certificate {...certificateProps} />
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-glass bg-glass backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <button
              onClick={handleExport}
              disabled={isDownloading}
              className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-primary hover:opacity-90 font-semibold text-base sm:text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-primary text-white"
            >
              {isDownloading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">
                    Downloading PDF...
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Download PDF</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
