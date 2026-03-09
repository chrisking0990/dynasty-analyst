import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define all routes that do NOT require a user to be logged in
const isPublicRoute = createRouteMatcher([
  "/",                      // Your landing page
  "/api/sync",              // The temporary route to populate your database
  "/api/sleeper(.*)",       // Allows your app to fetch Sleeper data before logging in
  "/api/webhooks(.*)",      // Allows Stripe and Clerk to talk to your app
  "/api/webhook"            // Legacy stripe webhook path just in case
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is NOT in the public list above, protect it
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};