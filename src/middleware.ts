import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  
  // Remove any X-Frame-Options header that might be set elsewhere
  response.headers.delete("x-frame-options");
  
  // Ensure iframe embedding is always allowed
  response.headers.set("content-security-policy", "frame-ancestors *;");
  
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico).*)"
  ]
};