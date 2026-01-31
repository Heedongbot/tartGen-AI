import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: ideaId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        // Check ownership
        const idea = await prisma.idea.findUnique({
            where: { id: ideaId },
            select: { userId: true, isPublic: true }
        });

        if (!idea || idea.userId !== user.id) {
            return NextResponse.json({ error: "권한이 없거나 존재하지 않는 아이디어입니다." }, { status: 403 });
        }

        const updatedIdea = await prisma.idea.update({
            where: { id: ideaId },
            data: { isPublic: !idea.isPublic }
        });

        return NextResponse.json({
            success: true,
            isPublic: updatedIdea.isPublic,
            message: updatedIdea.isPublic ? "커뮤니티에 공개되었습니다." : "공개가 취소되었습니다."
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
