import { NextRequest, NextResponse } from 'next/server';

// Example security headers middleware
export function securityHeaders(req: NextRequest) {
    const res = NextResponse.next();
    res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
}
