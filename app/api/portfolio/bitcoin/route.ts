// src/app/api/portfolio/bitcoin/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import type { PortfolioBalance } from '@/types';

async function fetchBitcoinPortfolio(
  bitcoinAddress: string
): Promise<{ balances: PortfolioBalance[]; totalValue: number }> {
  try {
    console.log('[Bitcoin] Fetching portfolio for:', bitcoinAddress);

    // Fetch balance from blockchain.info (free, no API key needed)
    // tested and trusted using this address bc1qwzrryqr3ja8w7hnja2spmkgfdcgvqwp5swz4af4ngsjecfz0w0pqud7k38 
    // cause i had no bitcoin found it somewhere lol.
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

    const portfolio = await fetchBitcoinPortfolio(address);
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('[BITCOIN_PORTFOLIO_API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin portfolio' },
      { status: 500 }
    );
  }
}
