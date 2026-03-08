import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define the webhooks as public so Stripe and Clerk can reach them
const isPublicRoute = createRouteMatcher([
  "/api/webhooks/clerk", 
  "/api/webhooks/stripe",
  "/api/webhook" // Your existing stripe webhook path
]);

export default clerkMiddleware(async (auth, req) => {
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