import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const qry = searchParams.get("qry");

    if (!qry) {
      return NextResponse.json(
        { error: "질문(qry) 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // Gemini 모델 가져오기
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const query = `
    MarketBeat,
    Barchart,
    TipRanks,
    zacks,
    Yahoo Finance,
    seekingalpha,
    simplywall.st,
    marketwatch,
    tradingview

    예를들어 marketbeat 라는 사이트에서 정보를 가져온다면,
    https://www.marketbeat.com/stocks/NASDAQ/{종목코드}/forecast/?utm_source=chatgpt.com
    이렇게 사이트를 직접 방문해서

 분석해서,
나스닥 종목코드 ${qry}의 
추천점수를 1점(강령매도)~10점(강력매수) 범위로 환산해서 알려줘

json 아래의 형태로 응답해주면 좋을것 같아.

{
  "ticker": "...",
  "companyName": "...",
  "requestDate": "...",
  "summary": {
    "averageScore": 7.4,
    "conclusion_kr": "전반적으로 다수의 금융 정보 사이트에서 긍정적인 '매수(Buy)' 의견을 보이고 있습니다. 특히 애널리스트 컨센서스와 Zacks Rank가 긍정적이며, 기술적 지표도 이를 뒷받침합니다. Simply Wall St의 경우 장기적 관점에서 '적정 가치'로 평가하여 다소 중립적인 시각을 보입니다. 종합적인 점수는 '매수'에 가까운 '긍정적' 수준입니다.",
    "scoreMeaning": {
      "1-2": "강력 매도 (Strong Sell)",
      "3-4": "매도 (Sell)",
      "5-6": "중립 (Hold)",
      "7-8": "매수 (Buy)",
      "9-10": "강력 매수 (Strong Buy)"
    }
  },
  "analysisBySource": [
    {
      "source": "MarketBeat",
      "ratingText": "Buy",
      "score": 8,
      "summary_kr": "소수 애널리스트의 컨센서스가 'Buy' 등급을 유지하고 있으며, 제시된 목표 주가가 현재 주가 대비 상승 여력이 있음을 기반으로 평가했습니다.",
      "url": "https://www.marketbeat.com/stocks/NASDAQ/FTLF/forecast/"
    },
    ...
  ],
}`;

    // 질문 생성
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(extractJsonFromMarkdown(text), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=1800", // 30분 캐시
        "CDN-Cache-Control": "public, s-maxage=1800",
        "Vercel-CDN-Cache-Control": "public, s-maxage=1800",
      },
    });
  } catch (error: unknown) {
    console.error("Gemini API 오류:", error);

    return NextResponse.json(
      {
        error: "AI 응답 생성 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qry, options = {} } = body;

    if (!qry) {
      return NextResponse.json(
        { error: "질문(qry) 필드가 필요합니다." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 모델 설정 (옵션으로 커스터마이징 가능)
    const modelConfig = {
      model: options.model || "gemini-pro",
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxOutputTokens || 1024,
      },
    };

    const model = genAI.getGenerativeModel(modelConfig);

    // 질문 생성
    const result = await model.generateContent(qry);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(
      {
        question: qry,
        answer: text,
        options: modelConfig,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=300",
          "Vercel-CDN-Cache-Control": "public, s-maxage=300",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Gemini API 오류:", error);

    return NextResponse.json(
      {
        error: "AI 응답 생성 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

function extractJsonFromMarkdown(textResponse: string) {
  // 정규표현식을 사용하여 ```json 과 ``` 사이의 내용을 찾습니다.
  // 's' 플래그는 '.'이 줄바꿈 문자(\n)도 포함하여 매치되도록 합니다.
  const match = textResponse.match(/```json\s*([\s\S]*?)\s*```/);

  // 매치된 그룹이 있다면(match[1]에 JSON 문자열이 담김)
  if (match && match[1]) {
    const jsonString = match[1];
    try {
      // 추출한 문자열을 JSON 객체로 파싱(변환)합니다.
      return JSON.parse(jsonString);
    } catch (error) {
      // 파싱 중 에러가 발생하면 콘솔에 로그를 남기고 null을 반환합니다.
      console.error("JSON 파싱 오류:", error);
      return null;
    }
  } else {
    // ```json ... ``` 블록을 찾지 못하면 null을 반환합니다.
    return null;
  }
}
