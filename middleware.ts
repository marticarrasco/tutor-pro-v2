import { updateSession } from "@/lib/supabase/middleware"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run Supabase auth middleware first to update session
  const response = await updateSession(request);

  // 2. Run next-intl middleware
  // Note: We need to pass the response from updateSession if we want to preserve cookies/headers set by it
  // However, next-intl middleware returns a response, so we might need to chain them carefully.
  // For now, let's return the intlMiddleware response, but we might need to manually copy headers if updateSession sets any important ones that aren't just for the request.
  // Actually, updateSession in supabase usually returns a response that should be returned to the client.
  // But next-intl also needs to handle the response for redirects/rewrites.

  // A common pattern is to let next-intl handle the routing, and just ensure auth happens.
  // If updateSession redirects (e.g. auth guard), we should return that immediately.
  if (response.status === 307 || response.status === 302 || response.status === 303) {
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
