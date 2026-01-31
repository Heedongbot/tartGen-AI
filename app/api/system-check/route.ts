import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    const status = {
        database: {
            configured: !!process.env.DATABASE_URL,
            directUrl: !!process.env.DIRECT_URL,
            connected: false,
            schema: false,
            error: null as string | null
        },
        auth: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        },
        env: process.env.NODE_ENV
    };

    try {
        if (prisma) {
            // Try a simple query to assert connection
            await prisma.$queryRaw`SELECT 1`;
            status.database.connected = true;

            // Check Schema (Try to access User table)
            try {
                await prisma.user.count({ take: 1 });
                status.database.schema = true;
            } catch (e) {
                status.database.schema = false;
                status.database.error = "테이블이 없습니다 (Schema Missing)";
            }
        } else {
            status.database.error = "Prisma Client 초기화 실패 (DATABASE_URL 확인)";
        }
    } catch (e: any) {
        status.database.error = e.message;
        console.error("Health Check DB Error:", e);
    }

    return NextResponse.json(status);
}
