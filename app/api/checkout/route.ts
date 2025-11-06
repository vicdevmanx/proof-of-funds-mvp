import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import PaymentSession from '@/models/paymentSession';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { walletAddress, name, balances, totalValue } = await req.json(); 

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: "price_1SPloaGXfq9LW0GYEnIojqCQ", 
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?payment_canceled=true`,
      metadata: { 
        walletAddress,
        holderName: name,
      },
    });

    // Store session data in database (balances can be large, exceeding Stripe metadata limits)
    await connectDB();
    await PaymentSession.create({
      sessionId: session.id,
      walletAddress,
      holderName: name,
      balances,
      totalValue,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}