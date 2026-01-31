import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import Prisma client

export const dynamic = 'force-dynamic';

// Use the existing GOOGLE_API_KEY with fallbacks
export async function POST(request: NextRequest) {
  try {
    // Try multiple possible environment variable names
    const apiKey = process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("❌ API Key Missing. Available Keys:", Object.keys(process.env).filter(k => k.includes("API") || k.includes("KEY")));
      throw new Error("GOOGLE_API_KEY is missing in environment variables. Please check Vercel settings.");
    }

    // Initialize inside the handler to handle environment variable latency/absence safely
    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await request.json();
    // Map frontend fields to user code expectations
    const {
      continent,
      growthSpeed,
      marketSize,
      location,
      ageGroup: age,
      mbti,
      occupation,
      budget,
      time: timeCommit,
      interests,
      tier
    } = body;

    // ✅ 핵심: JSON 모드 강제 설정 (User requested configuration)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",  // Verified available model from user's key list
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 8192,           // 충분한 토큰 할당
        responseMimeType: "application/json", // 🔑 완벽한 JSON 강제
      },
    });

    const prompt = `
당신은 글로벌 창업 전문가입니다.

창업 시장 설정 (기본):
- 타겟 대륙: ${continent || "미지정 (Global)"}
- 희망 성장 속도: ${growthSpeed || "Moderate"}
- 시장 규모: ${marketSize || "Medium"}

사용자 개인 프로필 (PRO 전용 - 제공된 경우에만 반영):
- 위치: ${location || "미공개"}
- 나이: ${age || "미공개"}
- MBTI: ${mbti || "미공개"}
- 직업: ${occupation || "미공개"}
- 예산: ${budget || "미공개"}
- 시간: ${timeCommit || "미공개"}
- 관심사: ${interests?.join(", ") || "미공개"}

요금제 등급: ${tier || "FREE"}

다음 JSON 스키마에 맞춰 창업 아이디어를 생성하세요:

{
  "title": "매력적인 아이디어 제목",
  "description": "200-250단어의 상세 설명",
  "marketAnalysis": {
    "direction": "시장의 흐름, 트렌드, 향후 전망 (상세히)",
    "value": "이 아이디어의 독특한 가치 제안 및 경제적 잠재력 (상세히)"
  },
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
    }
  ]
}

위 JSON 스키마를 정확히 따라 유효한 JSON만 반환하세요.`;

    // 🔄 Auto-Retry Logic with Exponential Backoff
    let result;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    while (retryCount <= MAX_RETRIES) {
      try {
        result = await model.generateContent(prompt);
        break; // Success
      } catch (e: any) {
        if (e.message?.includes("429") || e.message?.includes("Resource exhausted")) {
          retryCount++;
          if (retryCount > MAX_RETRIES) throw e;

          const waitTime = 2000 * Math.pow(2, retryCount - 1); // 2s, 4s, 8s
          console.log(`⚠️ Rate limit hit. Retrying in ${waitTime / 1000}s... (Attempt ${retryCount}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw e; // Other errors, fail immediately
        }
      }
    }

    const responseText = result?.response.text() || "";

    console.log("🔍 Gemini JSON Response:", responseText.substring(0, 200) + "...");

    // Sanitize the response (remove Markdown code blocks if present)
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let rawData;
    try {
      rawData = JSON.parse(cleanedText);
      // 🔥 AI가 리스트 형식을 반환했을 경우 (Gemini 2.0 특정 상황 대비)
      if (Array.isArray(rawData)) {
        rawData = rawData[0];
      }
    } catch (parseError) {
      console.error("JSON Parse Failed:", cleanedText);
      throw new Error("AI 응답을 해석할 수 없습니다. (JSON Parsing Error)");
    }

    // 기본 검증
    if (!rawData.title) {
      console.error("Missing Title. Raw Data:", rawData);
      throw new Error(`필수 필드 누락: title (받은 데이터: ${JSON.stringify(rawData).substring(0, 100)}...)`);
    }

    // 🔄 Compatibility Adapter: Transform new AI Data to match Existing Frontend UI
    const normalizedData = {
      title: rawData.title,
      description: rawData.description,
      market: {
        size: rawData.marketData?.size || "N/A",
        growth: rawData.marketData?.growthRate || "N/A",
        competition: rawData.marketData?.competition || "N/A",
        direction: rawData.marketAnalysis?.direction || "해당하는 정보가 없습니다.",
        value: rawData.marketAnalysis?.value || "해당하는 정보가 없습니다."
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

    // 💾 Database Saving REMOVED used to be here
    // Manual save implemented in /api/ideas/save

    // Return generated data (without saving)
    return NextResponse.json({
      success: true,
      id: null,
      ...normalizedData,
      raw: rawData,
      metadata: {
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("❌ API 에러 상세:");
    console.error("메시지:", error.message);

    // 🚦 Handle Rate Limiting (429) specifically
    if (error.message?.includes("429") || error.message?.includes("Resource exhausted")) {
      return NextResponse.json({
        error: "사용자가 많아 AI가 잠시 쉬고 있습니다 😅",
        details: "1분 뒤에 다시 시도해주세요. (Google API Rate Limit)",
        isRateLimit: true
      }, { status: 429 });
    }

    return NextResponse.json({
      error: "아이디어 생성 실패",
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
