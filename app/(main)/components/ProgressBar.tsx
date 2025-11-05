"use client";

import { Check } from "lucide-react";

interface ProgressBarProps {
  step: number;
}

export function ProgressBar({ step }: ProgressBarProps) {
  return (
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
  );
}
