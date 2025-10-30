import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import MultiChainProvider from "@/providers/MultiChainProvider";

export const metadata: Metadata = {
  title: "Proof of Funds Generator - Demo",
  description:
    "Generate professional proof of funds documents for your crypto portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
      // className={` antialiased`}
      >
        <ThemeProvider>
          <MultiChainProvider>{children}</MultiChainProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
