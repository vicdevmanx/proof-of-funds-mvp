import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import MultiChainProvider from "@/providers/MultiChainProvider";
import { Toaster } from "sonner";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body
      // className={` antialiased`}
      >
        <ThemeProvider>
          <MultiChainProvider>
            {children}
            <Toaster
              position="top-center"
            />
          </MultiChainProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
