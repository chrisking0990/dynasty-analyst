import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  // Use the specific version your package requires
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-02-25.clover", 
  });
  
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("❌ Webhook Signature Verification Failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 👇 FIX: Look in client_reference_id FIRST, then fallback to metadata
    const userId = session.client_reference_id || session.metadata?.userId;

    console.log("🔔 Webhook received for User ID:", userId);

    if (!userId) {
      console.error("❌ ERROR: No userId found in Stripe session. Cannot update Clerk.");
      return new NextResponse("No User ID found", { status: 400 });
    }

    try {
      console.log("System: Attempting to update Clerk Metadata for:", userId);
      // Flipped the switch to Pro!
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          isPro: true,
        },
      });
      console.log("✅ SUCCESS: Clerk profile updated for:", userId);
    } catch (clerkError: any) {
      console.error("❌ CLERK UPDATE FAILED:", clerkError.message);
      return new NextResponse("Clerk update failed", { status: 500 });
    }
  }

  return new NextResponse("Success", { status: 200 });
}