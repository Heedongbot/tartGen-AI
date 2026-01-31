import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            // Inputs
            location, age, mbti, occupation, budget, timeCommit, interests,
            continent, growthSpeed, marketSize, tier,
            // Generated Content
            title, description, market, whyYou, roadmap, products
        } = body;

        if (!prisma) {
            throw new Error("Database connection not initialized");
        }

        // 🔐 Auth Check
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        let targetUserId: string;

        if (authUser) {
            // 👤 Logged in user
            const prismaUser = await prisma.user.upsert({
                where: { id: authUser.id },
                update: { email: authUser.email },
                create: { id: authUser.id, email: authUser.email }
            });
            targetUserId = prismaUser.id;
        } else {
            // 👻 Guest user
            const guestUser = await prisma.user.create({ data: {} });
            targetUserId = guestUser.id;
        }

        // 💾 Save to DB
        const idea = await prisma.idea.create({
            data: {
                userId: targetUserId,
                // Inputs
                location: location || "",
                age: age || "",
                mbti: mbti || "",
                occupation: occupation || "",
                budget: typeof budget === 'number' ? budget : parseInt(budget as string) || 0,
                timeCommit: timeCommit || "",
                interests: interests || [],
                continent: continent || "Global",
                growthSpeed: growthSpeed || "Moderate",
                marketSize: marketSize || "Medium",
                tier: tier || "FREE",
                // Content
                title: title,
                description: description,
                marketData: market, // JSON
                // whyYou arrives as array from frontend, join if needed or store matches schema
                // Schema says whyYou is String (@db.Text). Frontend Result has string[].
                whyYou: Array.isArray(whyYou) ? whyYou.join("\n") : whyYou,
                roadmap: roadmap, // JSON
                products: products, // JSON
                isPublic: false
            }
        });

        return NextResponse.json({ success: true, id: idea.id });

    } catch (error: any) {
        console.error("Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
