// app/api/solana/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API Route: Fetch Solana Portfolio via Helius DAS API
 * 
 * This route proxies requests to Helius RPC to avoid CORS issues
 * and keep the API key secure on the server side.
 */

type SolanaCluster = 'mainnet-beta' | 'devnet';

const CLUSTER_ENDPOINTS: Record<SolanaCluster, string> = {
  'mainnet-beta': 'https://mainnet.helius-rpc.com/?api-key=',
  'devnet': 'https://devnet.helius-rpc.com/?api-key=',
};

export async function POST(request: NextRequest) {
  try {
    const { address, cluster = 'devnet' } = await request.json();

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

    const endpoint = CLUSTER_ENDPOINTS[cluster as SolanaCluster] || CLUSTER_ENDPOINTS['devnet'];

    console.log(`[API] Fetching Solana portfolio for ${address} on ${cluster}`);

    // Call Helius DAS API
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
        timeout: 30000, // 30 second timeout
      }
    );

    if (response.data.error) {
      console.error('[API] Helius RPC Error:', response.data.error);
      return NextResponse.json(
        { error: response.data.error.message || 'RPC Error' },
        { status: 500 }
      );
    }

    console.log(`[API] Successfully fetched portfolio for ${address}`);

    return NextResponse.json({
      success: true,
      data: response.data.result,
    });
  } catch (error: any) {
    console.error('[API] Error fetching Solana portfolio:', error.message);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch portfolio from Helius',
          details: error.response?.data || error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
