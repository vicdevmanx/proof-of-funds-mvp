"use client";

import { X, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InAppBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  walletName: string;
}

export function InAppBrowserModal({
  isOpen,
  onClose,
  pdfUrl,
  walletName,
}: InAppBrowserModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-glass border border-glass rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-glass transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-theme">
              Download in External Browser
            </h3>
            <p className="text-sm text-muted-foreground">
              {walletName} browser doesn't support direct downloads. Please use
              one of the options below:
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Open in Browser Button */}
            {/* <button
              onClick={handleOpenExternal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-primary hover:opacity-90 font-semibold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Open in External Browser</span>
            </button> */}

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-xl bg-gradient-primary border border-glass hover:bg-glass/80 font-semibold text-theme transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Download Link</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-glass border border-glass">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-theme">Tip:</strong> After copying the
              link, open Safari, Chrome, or your default browser and paste it
              there to download your certificate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
