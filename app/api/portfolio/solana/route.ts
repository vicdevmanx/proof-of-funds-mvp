// app/api/portfolio/solana/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import type { PortfolioBalance } from '@/types';

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

const CLUSTER_ENDPOINTS: Record<SolanaCluster, string> = {
  'mainnet-beta': 'https://mainnet.helius-rpc.com/?api-key=',
  'devnet': 'https://devnet.helius-rpc.com/?api-key=',
};

export async function POST(request: NextRequest) {
  try {
    const { address, cluster = 'mainnet-beta' } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!HELIUS_API_KEY) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 }
      );
    }

    const endpoint = CLUSTER_ENDPOINTS[cluster as SolanaCluster] || CLUSTER_ENDPOINTS['mainnet-beta'];
// didn't have solana on mainnet, so i tested with this address on mainnet 244b9oPYSG2tbz8q3KfeRNoFBEGHnV3sExbpjUb8C2rj . got it from dexscreener
    const response = await axios.post(
      `${endpoint}${HELIUS_API_KEY}`,
      {
        jsonrpc: '2.0',
        id: 'portfolio-fetch',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
          limit: 1000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error.message || 'RPC Error');
    }

    const data: DASResult = response.data.result;
    const balances: PortfolioBalance[] = [];
    let totalValue = 0;

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

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
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
      }
    }

    balances.sort((a, b) => b.value - a.value);

    return NextResponse.json({
      balances,
      totalValue: Number(totalValue.toFixed(2)),
    });
  } catch (error: any) {
    console.error('[SOLANA_PORTFOLIO_API]', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch Solana portfolio' },
      { status: 500 }
    );
  }
}
