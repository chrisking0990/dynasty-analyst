import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

// Initialize Stripe using your secret key from Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16", 
});

export async function POST(req: Request) {
  try {
    // 1. Make sure the user is actually logged into Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // 2. Figure out the website URL to send them back to after they pay
    const origin = req.headers.get("origin") || "https://www.dynastyanalyst.com";

    // 3. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          // This must be your Live Price ID from Stripe!
          price: process.env.STRIPE_PRICE_ID, 
          quantity: 1,
        },
      ],
      
      // 👇 THIS TURNS ON THE PROMO CODE BOX 👇
      allow_promotion_codes: true,

      // This passes the Clerk User ID to Stripe, so your webhook knows who paid
      client_reference_id: userId,
      
      // Where to redirect the user after the transaction
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    // 4. Send the Stripe checkout link back to your frontend button
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error("STRIPE CHECKOUT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}