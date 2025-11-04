import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import MultiChainProvider from "@/providers/MultiChainProvider";
import { Toaster } from "react-hot-toast";

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
          <MultiChainProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </MultiChainProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
