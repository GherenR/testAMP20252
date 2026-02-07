import { NextRequest, NextResponse } from 'next/server';

// Example rate limiting middleware
const RATE_LIMIT = 5; // max 5 requests per minute
const WINDOW_MS = 60 * 1000;
const ipRequests: Record<string, { count: number; timestamp: number }> = {};

export function rateLimit(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (!ipRequests[ip] || now - ipRequests[ip].timestamp > WINDOW_MS) {
        ipRequests[ip] = { count: 1, timestamp: now };
    } else {
        ipRequests[ip].count++;
    }
    if (ipRequests[ip].count > RATE_LIMIT) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.next();
}
