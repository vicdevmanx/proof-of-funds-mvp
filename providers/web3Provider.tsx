"use client";

import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { mainnet, base, sepolia } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "@/components/theme-provider";

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const config = getDefaultConfig({
    appName: "POF-Generator-Demo",
    projectId: "b2d96c00acace963d89e276862020a17",
    chains: [mainnet, base, sepolia],
    // ssr: false
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider  theme={theme === "dark" ? darkTheme() : lightTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};


export default Web3Provider