import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 10;

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

setInterval(cleanupExpiredEntries, RATE_LIMIT_WINDOW);

export function rateLimit(
    req: NextRequest,
    maxRequests: number = MAX_REQUESTS,
    windowMs: number = RATE_LIMIT_WINDOW
): NextResponse | null {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const path = new URL(req.url).pathname;
    const key = `${ip}:${path}`;

    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return null;
    }

    if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        logger.warn("Rate limit exceeded", { ip, path, count: entry.count });

        return NextResponse.json(
            {
                error: "Too many requests",
                message: "You have exceeded the rate limit. Please try again later.",
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": retryAfter.toString(),
                    "X-RateLimit-Limit": maxRequests.toString(),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": entry.resetTime.toString(),
                },
            }
        );
    }

    entry.count++;
    rateLimitMap.set(key, entry);

    return null;
}
