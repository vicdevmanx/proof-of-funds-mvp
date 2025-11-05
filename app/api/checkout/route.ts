import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { walletAddress, name, balances, totalValue } = await req.json(); // Pass data if needed for metadata

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_YourPriceIDFromDashboard', // Replace with your price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      metadata: { // Optional: Store extra data
        walletAddress,
        holderName: name,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}