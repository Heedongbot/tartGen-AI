import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { z } from 'zod';

const GenerateSchema = z.object({
    title: z.string(),
    description: z.string(),
    whyYou: z.array(z.string()),
    market: z.object({
        size: z.string(),
        growth: z.string(),
        competition: z.string(),
    }),
    roadmap: z.array(z.object({
        week: z.string(),
        task: z.string(),
    })),
    products: z.array(z.object({
        name: z.string(),
        price: z.string(),
        image: z.string().optional(),
        link: z.string(),
    })),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check for API Key
        if (!process.env.OPENAI_API_KEY) {
            console.log("Using Mock Data (No API Key found)");
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
            return NextResponse.json(getMockData(body));
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo", // or gpt-4o if available
            messages: [
                { role: "system", content: "You are a startup consultant AI. Generate a personalized startup idea based on the user's profile. Return JSON matching the schema." },
                { role: "user", content: `Profile: ${JSON.stringify(body)}` },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        // Validate with Zod
        const idea = GenerateSchema.parse(JSON.parse(content));
        return NextResponse.json(idea);

    } catch (error) {
        console.error("AI Generation Failed:", error);
        // Fallback to mock if API fails
        return NextResponse.json(getMockData(await req.json().catch(() => ({}))));
    }
}

function getMockData(body: any) {
    let title = "AI-Powered SaaS Platform";
    let description = "A revolutionary platform that automates workflows for small businesses.";

    if (body.mbti && body.mbti.includes("E")) {
        title = "Community-Driven Social Network";
        description = "A localized vertical social network connecting people with similar niche interests.";
    }

    if (body.occupation === "Developer") {
        title = "Code Review Automation Tool";
        description = "An AI agent that provides real-time, context-aware code reviews for junior developers.";
    }

    return {
        title,
        description,
        whyYou: [
            `${body.mbti || "User"} Type Strength: Leveraging your natural ability to connect patterns.`,
            `Location Advantage: ${body.location || "Your City"} has a growing ecosystem for this industry.`,
            `Budget Fit: Can be started lean within your ₩${body.budget?.toLocaleString() || "budget"}.`
        ],
        market: {
            size: "$4.2B",
            growth: "+18.5%",
            competition: "Moderate"
        },
        roadmap: [
            { week: "Week 1-2", task: "Market Research & Validation landing page" },
            { week: "Week 3-4", task: "MVP Development (Core Feature)" },
            { week: "Week 5-6", task: "Beta Testing with 10 users" },
            { week: "Week 7-8", task: "Official Launch & Marketing" }
        ],
        products: [
            { name: "Vercel Pro", price: "$20/mo", link: "https://vercel.com", image: "" },
            { name: "Supabase", price: "Free Tier", link: "https://supabase.com", image: "" },
            { name: "Cursor AI", price: "$20/mo", link: "https://cursor.sh", image: "" },
            { name: "Stripe Atlas", price: "$500", link: "https://stripe.com/atlas", image: "" }
        ]
    };
}
