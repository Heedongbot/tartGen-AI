import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        const ideas = await prisma.idea.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: skip,
            select: {
                id: true,
                title: true,
                description: true,
                location: true,
                continent: true,
                createdAt: true,
                viewCount: true,
                likeCount: true,
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        // Simple obfuscation of emails for privacy
        const sanitizedIdeas = ideas.map((idea: any) => ({
            ...idea,
            authorName: idea.user.email ? idea.user.email.split('@')[0].slice(0, 3) + '***' : "익명 창업가"
        }));

        return NextResponse.json({ success: true, ideas: sanitizedIdeas });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
