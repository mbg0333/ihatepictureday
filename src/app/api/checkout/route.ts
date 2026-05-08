import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const { items, customerInfo } = await req.json();

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.style}`,
          description: `Photo: ${item.fileName}`,
        },
        unit_amount: item.unitPrice * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${new URL(req.url).origin}/big-heads/builder?success=true`,
      cancel_url: `${new URL(req.url).origin}/big-heads/builder`,
      customer_email: customerInfo.email,
      metadata: {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
        orderData: JSON.stringify(items.map((i: any) => ({ style: i.style, qty: i.quantity, file: i.fileName }))),
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
