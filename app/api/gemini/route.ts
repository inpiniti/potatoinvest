import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// JSON 추출 함수 추가
function extractJsonFromMarkdown(text: string) {
  try {
    // ```json ... ``` 형태에서 JSON 추출
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 마크다운 코드 블록이 없다면 전체 텍스트를 JSON으로 파싱 시도
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON 파싱 오류:", error, text);
    // 파싱 실패시 원본 텍스트 반환
    return { error: "JSON 파싱 실패", rawResponse: error };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qry = searchParams.get("qry");

    if (!qry) {
      return NextResponse.json(
        { error: "질문(qry) 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: [
        `당신은 전문 금융 분석가 AI입니다. 주식 티커를 받아 실시간 데이터를 분석하고 요청된 JSON 형식으로만 응답하세요. 인사말이나 설명 없이 JSON만 제공하세요.

        나스닥 종목코드 ${qry}에 대해 다음 사이트들을 분석해서 JSON 형태로만 응답해주세요:

        https://www.marketbeat.com/stocks/NASDAQ/${qry}/
        https://www.barchart.com/stocks/quotes/${qry}
        https://www.tipranks.com/stocks/${qry}/forecast
        https://www.zacks.com/stock/quote/${qry}
        https://finance.yahoo.com/quote/${qry}/
        https://www.marketwatch.com/investing/stock/${qry}
        https://valueinvesting.io/stocks/${qry}
        https://www.stockinvest.us/stock/${qry}
        https://www.morningstar.com/stocks/xnas/${qry}

        다음 JSON 구조로만 응답하세요:
        {
          "companyName": "회사명",
          "ticker": "${qry}",
          "requestDate": "2025-01-15",
          "summary": {
            "averageScore": 3.2,
            "totalAnalysts": 3,
            "scoreMeaning": {
              "5": "강력매수",
              "4": "매수", 
              "3": "중립",
              "2": "매도",
              "1": "강력매도"
            },
            "conclusion_kr": "종합 분석 결론"
          },
          "analysisBySource": [
            {
              "source": "MarketBeat",
              "score": 4,
              "ratingText": "매수",
              "targetPrice": "$50.00",
              "analystCount": 4,
              "summary_kr": "분석 요약",
              "url": "실제 URL"
            }
          ]
        }`,
      ],
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
      },
    });

    return NextResponse.json(extractJsonFromMarkdown(response.text || ""), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=1800",
      },
    });
  } catch (error: unknown) {
    console.error("Gemini API 오류:", error);
    return NextResponse.json(
      { error: "AI 응답 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
