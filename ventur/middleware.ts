import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Let Supabase handle session management and route protection
    const response = await updateSession(request)

    // If Supabase middleware returned a redirect, preserve it
    if (response.status === 307 || response.status === 308) {
        return response;
    }

    // Add security headers to the response
    const headers = new Headers(response.headers)

    // Security Headers
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com",
        "frame-src https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ')

    headers.set('Content-Security-Policy', csp)

    // Create new response with security headers
    const newResponse = NextResponse.next({
        request,
        headers
    })

    // Copy cookies from Supabase response
    response.cookies.getAll().forEach(cookie => {
        newResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    return newResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes (handled separately)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
    ],
}