import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const ideas = await prisma.idea.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, ideas });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
