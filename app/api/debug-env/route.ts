import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const dbUrl = process.env.DATABASE_URL;
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Security: DO NOT return actual values
    const envStatus = {
        GOOGLE_API_KEY: {
            exists: !!apiKey,
            length: apiKey ? apiKey.length : 0,
            firstChar: apiKey ? apiKey.substring(0, 1) : "N/A",
            is_gpt_key: apiKey?.startsWith("sk-") || false,
            is_google_key: apiKey?.startsWith("AIza") || false,
        },
        DATABASE_URL: {
            exists: !!dbUrl,
            length: dbUrl ? dbUrl.length : 0,
        },
        NEXT_PUBLIC_SUPABASE_URL: {
            exists: !!supaUrl,
        },
        NODE_ENV: process.env.NODE_ENV,
        // List all keys visible to the process (excluding values)
        ALL_KEYS: Object.keys(process.env).sort(),
    };

    return NextResponse.json(envStatus);
}
