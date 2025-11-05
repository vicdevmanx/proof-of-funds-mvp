// src/app/api/portfolio/evm/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import type { PortfolioBalance } from '@/types';

async function fetchEVMPortfolio(
  evmAddress: string
): Promise<{ balances: PortfolioBalance[]; totalValue: number }> {
  const ZAPPER_API_KEY = process.env.NEXT_PUBLIC_ZAPPER_API_KEY;
  const query = `query Portfolio($addresses: [Address!]!, $first: Int!) {
      portfolioV2(addresses: $addresses) {
        tokenBalances {
          totalBalanceUSD
          byToken(first: $first) {
            totalCount
            edges {
              node {
                name
                symbol
                price
                tokenAddress
                imgUrlV2
                decimals
                balanceRaw
                balance
                balanceUSD
                network {
                  name
                }
              }
            }
          }
        }
      }
    }`;

  try {
    const variables = {
      addresses: [evmAddress],
      first: 10,
    };

    const resp = await axios.post(
      'https://public.zapper.xyz/graphql',
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-zapper-api-key': ZAPPER_API_KEY,
        },
      }
    );

    if (resp.data.errors) {
      throw new Error(JSON.stringify(resp.data.errors));
    }

    const data = resp.data.data;
    const balanceData: PortfolioBalance[] = [];

    if (data?.portfolioV2?.tokenBalances?.byToken?.edges) {
      for (const edge of data.portfolioV2.tokenBalances.byToken.edges) {
        balanceData.push({
          token: edge.node.name,
          amount: Number(Number(edge.node.balance).toFixed(4)),
          imgUrl: edge.node.imgUrlV2,
          value: Number(Number(edge.node.balanceUSD).toFixed(2)),
          chain: edge.node.network.name,
          symbol: edge.node.symbol,
          address: edge.node.tokenAddress,
        });
      }
    }

    const totalValue = Number(
      data?.portfolioV2?.tokenBalances?.totalBalanceUSD || 0
    );

    return { balances: balanceData, totalValue };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        'EVM Portfolio fetch error:',
        err.response?.data || err.message
      );
    } else {
      console.error('EVM Portfolio fetch error:', (err as Error).message);
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const portfolio = await fetchEVMPortfolio(address);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('[EVM_PORTFOLIO_API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch EVM portfolio' },
      { status: 500 }
    );
  }
}
