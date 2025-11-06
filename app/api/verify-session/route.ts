// app/api/verify-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import PaymentSession from '@/models/paymentSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Retrieve session data from database
      await connectDB();
      const paymentSession = await PaymentSession.findOne({ sessionId: session_id });

      if (!paymentSession) {
        return NextResponse.json({ error: 'Session data not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        paid: true, 
        metadata: {
          walletAddress: paymentSession.walletAddress,
          holderName: paymentSession.holderName,
          balances: paymentSession.balances,
          totalValue: paymentSession.totalValue,
        }
      });
    } else {
      return NextResponse.json({ paid: false });
    }
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
