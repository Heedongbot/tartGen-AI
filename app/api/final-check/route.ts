import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY;

    return NextResponse.json({
        VERSION: "3.0-FINAL-CHECK",
        MESSAGE: "This is the latest code.",
        GOOGLE_API_KEY_EXISTS: !!apiKey,
        PROJECT_NAME: process.env.VERCEL_PROJECT_NAME || "UNKNOWN",
        TIME: new Date().toISOString()
    });
}
