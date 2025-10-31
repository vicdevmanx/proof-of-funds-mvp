// lib/portfolioFetchers.tsx
'use client';

import axios from 'axios';
import type { PortfolioBalance } from '@/types';

/**
 * ============================================================================
 * SOLANA PORTFOLIO FETCHER
 * ============================================================================
 */

interface DASAsset {
  id: string;
  interface: string;
  content?: {
    metadata?: { name: string; symbol: string };
    links?: { image?: string };
  };
  token_info?: {
    balance: string;
    decimals: number;
    price_info?: {
      price_per_token?: number;
      total_price?: number;
    };
    symbol?: string;
  };
  mint?: string;
}

interface DASResult {
  items: DASAsset[];
  nativeBalance?: {
    lamports: number;
    price_per_sol?: number;
    total_price?: number;
  };
}

type SolanaCluster = 'mainnet-beta' | 'devnet';

export const fetchSolanaPortfolioHelius = async (
  solanaAddress: string,
  cluster: SolanaCluster = 'mainnet-beta'
): Promise<{ balances: PortfolioBalance[]; totalValue: number }> => {
  try {
    console.log(`[Solana] Fetching portfolio for ${solanaAddress} on ${cluster}`);

    const response = await axios.post('/api/solana/portfolio', {
      address: solanaAddress,
      cluster,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch portfolio');
    }

    const data: DASResult = response.data.data;
    const balances: PortfolioBalance[] = [];
    let totalValue = 0;

    // Native SOL balance
    if (data.nativeBalance) {
      const solBalance = data.nativeBalance.lamports / 1e9;
      const solPrice = data.nativeBalance.price_per_sol || 0;
      const solValueUSD = data.nativeBalance.total_price || solBalance * solPrice;

      if (solBalance > 0) {
        balances.push({
          token: 'Solana',
          symbol: 'SOL',
          amount: Number(solBalance.toFixed(4)),
          value: Number(solValueUSD.toFixed(2)),
          chain: 'Solana',
          imgUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          address: 'So11111111111111111111111111111111111111112',
        });
        totalValue += solValueUSD;
      }
    }

    // SPL Tokens
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        try {
          if (!item.interface?.includes('Fungible') || !item.token_info?.balance || item.token_info.balance === '0') {
            continue;
          }

          const tokenAmount = Number(item.token_info.balance) / Math.pow(10, item.token_info.decimals || 0);
          const tokenPrice = item.token_info.price_info?.price_per_token || 0;
          const tokenValueUSD = item.token_info.price_info?.total_price || tokenAmount * tokenPrice;

          balances.push({
            token: item.content?.metadata?.name || item.token_info.symbol || 'Unknown',
            symbol: item.token_info.symbol || item.content?.metadata?.symbol || 'UNKNOWN',
            amount: Number(tokenAmount.toFixed(4)),
            value: Number(tokenValueUSD.toFixed(2)),
            chain: 'Solana',
            imgUrl: item.content?.links?.image || '',
            address: item.id || item.mint || '',
          });
          totalValue += tokenValueUSD;
        } catch (error) {
          console.warn(`[Solana] Error processing token ${item.id}:`, error);
        }
      }
    }

    balances.sort((a, b) => b.value - a.value);
    console.log(`[Solana] Found ${balances.length} assets. Total: $${totalValue.toFixed(2)}`);

    return {
      balances,
      totalValue: Number(totalValue.toFixed(2)),
    };
  } catch (err: unknown) {
    console.error('[Solana] Error:', err);
    throw new Error(`Failed to fetch Solana portfolio: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

/**
 * ============================================================================
 * BITCOIN PORTFOLIO FETCHER
 * ============================================================================
 */

export const fetchBitcoinPortfolio = async (
  bitcoinAddress: string
): Promise<{ balances: PortfolioBalance[]; totalValue: number }> => {
  try {
    console.log('[Bitcoin] Fetching portfolio for:', bitcoinAddress);

    // Fetch balance from blockchain.info (free, no API key needed)
    const balanceResponse = await axios.get(
      `https://blockchain.info/q/addressbalance/${bitcoinAddress}`,
      { timeout: 10000 }
    );

    const totalBtcSatoshis = Number(balanceResponse.data);
    const totalBtc = totalBtcSatoshis / 1e8;

    if (totalBtc === 0) {
      console.log('[Bitcoin] Address has no balance');
      return { balances: [], totalValue: 0 };
    }

    // Fetch BTC price from CoinGecko (free, no API key needed)
    const priceResponse = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );

    const btcPrice = priceResponse.data.bitcoin?.usd || 0;
    const totalValueUSD = totalBtc * btcPrice;

    console.log(`[Bitcoin] Balance: ${totalBtc.toFixed(8)} BTC ($${totalValueUSD.toFixed(2)})`);

    const balances: PortfolioBalance[] = [
      {
        token: 'Bitcoin',
        symbol: 'BTC',
        amount: Number(totalBtc.toFixed(8)),
        value: Number(totalValueUSD.toFixed(2)),
        chain: 'Bitcoin',
        imgUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        address: bitcoinAddress,
      },
    ];

    return {
      balances,
      totalValue: Number(totalValueUSD.toFixed(2)),
    };
  } catch (err: unknown) {
    console.error('[Bitcoin] Error:', err);
    throw new Error(`Failed to fetch Bitcoin portfolio: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

// Default export for backward compatibility
export const fetchSolanaPortfolio = fetchSolanaPortfolioHelius;
