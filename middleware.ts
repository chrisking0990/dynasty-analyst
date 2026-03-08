import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Add the homepage "/" and any landing pages to the public list
const isPublicRoute = createRouteMatcher([
  "/",                         // The landing page
  "/api/webhooks/clerk",       // Essential for sync
  "/api/webhooks/stripe",      // Essential for payments
  "/api/webhook"               // Your legacy stripe path
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Only protect the route if it is NOT in the public list
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};