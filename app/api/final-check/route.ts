import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const allKeys = Object.keys(process.env).sort();

    return NextResponse.json({
        VERSION: "4.0-DEEP-SCAN",
        PROJECT_NAME: process.env.VERCEL_PROJECT_NAME || "UNKNOWN",
        // Find any key that contains 'API' or 'KEY' or 'GOOGLE' or 'GEMINI'
        SEARCH_RESULTS: allKeys.filter(k =>
            k.includes("API") || k.includes("KEY") || k.includes("GOOGLE") || k.includes("GEMINI") || k.includes("DATABASE")
        ),
        ALL_KEYS_COUNT: allKeys.length,
        TIME: new Date().toISOString()
    });
}
