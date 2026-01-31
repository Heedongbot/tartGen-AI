import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idea = await prisma.idea.findUnique({
            where: { id: id },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        if (!idea) {
            return NextResponse.json({ error: "아이디어를 찾을 수 없습니다." }, { status: 404 });
        }

        // Increment view count
        await prisma.idea.update({
            where: { id: id },
            data: { viewCount: { increment: 1 } }
        });

        // Split whyYou string back into array
        const formattedWhyYou = typeof idea.whyYou === "string" ? idea.whyYou.split("\n") : idea.whyYou;

        return NextResponse.json({
            success: true,
            ...idea,
            whyYou: formattedWhyYou,
            market: idea.marketData
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
