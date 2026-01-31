import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const dbUrl = process.env.DATABASE_URL;

    const envStatus = {
        // Basic Check
        GOOGLE_API_KEY_STATE: apiKey ? `PRESENT (Length: ${apiKey.length})` : "MISSING ❌",
        DATABASE_URL_STATE: dbUrl ? "PRESENT" : "MISSING ❌",

        // Deployment Context (범인 찾기용)
        PROJECT_CONTEXT: {
            NAME: process.env.VERCEL_PROJECT_NAME || "UNKNOWN",
            ENV: process.env.VERCEL_ENV || "UNKNOWN",
            REGION: process.env.VERCEL_REGION || "UNKNOWN",
            COMMIT: process.env.VERCEL_GIT_COMMIT_MESSAGE || "UNKNOWN",
        },

        // All Keys (Values are hidden for security)
        VISIBLE_SYSTEM_KEYS: Object.keys(process.env).filter(k =>
            k.startsWith("VERCEL") || k.includes("NODE")
        ).sort(),

        // Custom Keys Check
        HAS_CUSTOM_KEYS: Object.keys(process.env).some(k =>
            !k.startsWith("VERCEL") && !k.startsWith("NODE") && !k.startsWith("AWS")
        )
    };

    return NextResponse.json(envStatus);
}
