import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis/Upstash in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
    '/api/createOrder': { requests: 5, windowMs: 60000 }, // 5 per minute
    '/api/products': { requests: 100, windowMs: 60000 },
    '/api/categories': { requests: 100, windowMs: 60000 },
};

function getRateLimitKey(req: NextRequest, path: string): string {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userId = req.headers.get('authorization')?.split('Bearer ')[1]?.substring(0, 10) || 'anon';
    return `${path}:${ip}:${userId}`;
}

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Apply rate limiting to API routes
    for (const [route, limit] of Object.entries(RATE_LIMITS)) {
        if (path.startsWith(route)) {
            const key = getRateLimitKey(request, route);
            const now = Date.now();
            const record = rateLimitMap.get(key);

            if (!record || now > record.resetTime) {
                rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs });
            } else if (record.count >= limit.requests) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429 }
                );
            } else {
                record.count++;
            }

            // Cleanup old entries
            if (rateLimitMap.size > 10000) {
                for (const [k, v] of rateLimitMap.entries()) {
                    if (now > v.resetTime) rateLimitMap.delete(k);
                }
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
