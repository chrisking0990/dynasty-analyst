import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define all routes that do NOT require a user to be logged in
const isPublicRoute = createRouteMatcher([
  "/",                      // Your landing page
  "/api/sync",              // Database population route
  "/api/sleeper(.*)",       // Sleeper API proxy
  "/api/webhooks(.*)",      // Stripe/Clerk webhooks
  "/api/webhook"            // Your current stripe webhook path
]);

export default clerkMiddleware(async (auth, req) => {
  // DEBUG LOG: Watch this in your Vercel logs when you "Resend" from Stripe
  if (req.nextUrl.pathname.startsWith("/api/webhook")) {
    console.log(`🔔 Webhook Request: ${req.method} ${req.nextUrl.pathname}`);
  }

  // If the route is NOT in the public list, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};