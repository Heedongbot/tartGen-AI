import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import Prisma client

// Use the existing GOOGLE_API_KEY
export async function POST(request: NextRequest) {
  try {
    // 🚨 EMERGENCY FIX: Harcoded key for immediate debugging (Will be removed later)
    const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyA-BJcZHBckk8_QmRMG-WXY2rY36xo9_6s";

    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is missing (even fallback failed)");
    }

    // Initialize inside the handler to handle environment variable latency/absence safely
    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await request.json();
    // Map frontend fields to user code expectations
    const { location, ageGroup: age, mbti, occupation, budget, time: timeCommit, interests } = body;

    // ✅ 핵심: JSON 모드 강제 설정 (User requested configuration)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",  // Use stable model name
      generationConfig: {
        temperature: 0.6,                // 일관성을 위해 약간 낮춤
        topP: 0.8,
        maxOutputTokens: 8192,           // 충분한 토큰 할당
        responseMimeType: "application/json", // 🔑 완벽한 JSON 강제
      },
    });

    const prompt = `
당신은 글로벌 창업 전문가입니다.

사용자 프로필:
- 위치: ${location}
- 나이: ${age}
- MBTI: ${mbti}
- 직업: ${occupation || "미제공"}
- 예산: ${budget || "미제공"}
- 시간: ${timeCommit || "미제공"}
- 관심사: ${interests?.join(", ") || "미제공"}

다음 JSON 스키마에 맞춰 창업 아이디어를 생성하세요:

{
  "title": "매력적인 아이디어 제목",
  "description": "200-250단어의 상세 설명",
  "marketData": {
    "size": "$X.XB 형식",
    "growthRate": "+XX% 형식",
    "competition": "낮음, 중간, 높음 중 하나"
  },
  "whyYou": {
    "mbtiStrengths": ["MBTI 강점 3개"],
    "locationAdvantage": "지역 특화 기회",
    "experienceMatch": "직업 경험 활용법"
  },
  "roadmap": [
    {
      "week": "1-2",
      "title": "단계 제목",
      "tasks": ["구체적 작업들"],
      "cost": "예상 비용"
    },
    {
      "week": "3-4", 
      "title": "다음 단계",
      "tasks": ["작업들"],
      "cost": "비용"
    }
  ],
  "products": [
    {
      "name": "필요한 제품명",
      "category": "제품 카테고리",
      "price": "$XX 또는 ₩XX,XXX 형식",
      "amazonKeyword": "검색 키워드"
    },
    {
      "name": "두 번째 제품",
      "category": "카테고리",
      "price": "가격",
      "amazonKeyword": "키워드"
    }
  ]
}

위 JSON 스키마를 정확히 따라 유효한 JSON만 반환하세요.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("🔍 Gemini JSON Response:", responseText.substring(0, 200) + "...");

    // JSON 모드 사용으로 직접 파싱 가능
    const rawData = JSON.parse(responseText);

    // 기본 검증
    if (!rawData.title || !rawData.description) {
      throw new Error("필수 필드 누락: title 또는 description");
    }

    // 🔄 Compatibility Adapter: Transform new AI Data to match Existing Frontend UI
    const normalizedData = {
      title: rawData.title,
      description: rawData.description,
      market: {
        size: rawData.marketData?.size || "N/A",
        growth: rawData.marketData?.growthRate || "N/A",
        competition: rawData.marketData?.competition || "N/A"
      },
      // Flatten 'whyYou' object into string array for Frontend
      whyYou: [
        ...(rawData.whyYou?.mbtiStrengths || []),
        rawData.whyYou?.locationAdvantage,
        rawData.whyYou?.experienceMatch
      ].filter(Boolean),

      // Map roadmap structure for Frontend
      roadmap: rawData.roadmap?.map((item: any) => ({
        week: item.week,
        task: `${item.title}: ${Array.isArray(item.tasks) ? item.tasks.join(', ') : item.tasks}`
      })) || [],

      // Map products and add link for Frontend
      products: rawData.products?.map((prod: any) => ({
        name: prod.name,
        price: prod.price,
        link: `https://www.google.com/search?q=${encodeURIComponent(prod.amazonKeyword || prod.name)}`
      })) || []
    };

    // 💾 Database Saving Logic (Graceful)
    try {
      if (prisma) {
        // Create a temporary user or link to existing (For MVP, we just create a new anonymous user per request)
        const user = await prisma.user.create({
          data: {}
        });

        await prisma.idea.create({
          data: {
            userId: user.id,
            location: location || "",
            age: age || "",
            mbti: mbti || "",
            occupation: occupation || "",
            budget: typeof budget === 'number' ? budget : parseInt(budget as string) || 0,
            timeCommit: timeCommit || "",
            interests: interests || [],

            // Generated Content
            title: normalizedData.title,
            description: normalizedData.description,
            marketData: normalizedData.market,
            whyYou: normalizedData.whyYou.join("\n"),
            roadmap: normalizedData.roadmap,
            products: normalizedData.products
          }
        });
        console.log("✅ Idea saved to database!");
      }
    } catch (dbError) {
      console.warn("⚠️ Database save failed (non-fatal):", dbError);
    }

    return NextResponse.json({
      success: true,
      ...normalizedData, // Frontend expects these keys at top level
      raw: rawData,      // Keep raw data for debugging
      metadata: {
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("❌ API 에러 상세:");
    console.error("메시지:", error.message);

    return NextResponse.json({
      error: "아이디어 생성 실패",
      details: error.message, // 프론트엔드에서 볼 수 있게 에러 메시지 포함
      stack: error.stack // 디버깅용 스택 트레이스 (보안상 주의 필요하지만 지금은 디버깅이 우선)
    }, { status: 200 }); // 200으로 보내서 클라이언트가 본문을 읽을 수 있게 함 (임시)
  }
}
