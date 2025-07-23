import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function extractJsonFromMarkdown(text: string) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON 파싱 오류:", error, text);
    return { error: "JSON 파싱 실패", rawResponse: text };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qry = searchParams.get("qry");

    if (!qry) {
      return NextResponse.json(
        { error: "종목코드(qry) 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split("T")[0];
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: [
        `당신은 전문 금융 뉴스 분석가 AI입니다. 종목코드 ${qry}의 최근 2-3일간 뉴스를 분석하여 호재/악재를 판단하고 JSON 형식으로만 응답하세요.
  
          ⚠️ 중요: 최근 ${threeDaysAgoStr} ~ ${todayStr} 기간에 해당하는 뉴스만 분석하세요. 
          이 기간에 뉴스가 없다면 "hasRecentNews": false로 명시하고 분석을 중단하세요.
  
          다음 뉴스 사이트들에서 ${qry} 관련 최근 뉴스를 검색하고 분석해주세요:
          
          https://finance.yahoo.com/quote/${qry}/news/
          https://www.marketwatch.com/investing/stock/${qry}?mod=mw_quote_tab
          https://seekingalpha.com/symbol/${qry}/news
          https://www.cnbc.com/quotes/${qry}
          https://www.bloomberg.com/quote/${qry}:US
          https://www.reuters.com/markets/companies/${qry}/
          https://finviz.com/quote.ashx?t=${qry}
          https://www.benzinga.com/quote/${qry}
          https://www.investing.com/equities/${qry}-news
          https://www.fool.com/quote/${qry}/
          https://www.barrons.com/market-data/stocks/${qry}
          https://www.nasdaq.com/market-activity/stocks/${qry}/news
          https://markets.businessinsider.com/stocks/${qry}-stock/news

          분석 시 다음 지침을 따르세요:
          - 각 뉴스 출처의 신뢰도(가중치)를 고려해 점수를 산정하세요. (예: Bloomberg, Reuters, Barron's는 신뢰도 ↑, Benzinga, Finviz는 신뢰도 ↓)
          - 동일한 뉴스(제목/링크)가 여러 사이트에 있으면 중복 제거 후 분석하세요.
          - 반드시 최근 3일 이내 뉴스만 분석하세요.
          - newsAnalysis에는 각 뉴스별 주요 키워드, 긍/부정 판단의 근거 문장도 포함하세요.
          - 거래량이 매우 적은 소형주나 특수상장주의 경우 뉴스 부재가 당연할 수 있으므로 이를 고려하세요.
  
          다음 JSON 구조로만 응답하세요:
          {
            "companyName": "회사명",
            "ticker": "${qry}",
            "analysisDate": "${todayStr}",
            "analysisperiod": "${threeDaysAgoStr} ~ ${todayStr}",
            "hasRecentNews": true,
            "dataAvailability": {
              "newsCount": 5,
              "sourcesWithData": ["Yahoo Finance", "MarketWatch"],
              "coverage": "양호/부족/없음"
            },
            "overallSentiment": {
              "score": 3.0,
              "rating": "중립",
              "scoreMeaning": {
                "5": "매우 긍정적 (강한 호재)",
                "4": "긍정적 (호재)",
                "3": "중립",
                "2": "부정적 (악재)",
                "1": "매우 부정적 (강한 악재)"
              },
              "summary_kr": "최근 뉴스 종합 분석 요약 또는 '최근 뉴스 데이터 없음'",
              "keyFactors": []
            },
            "newsAnalysis": [],
            "noNewsReason": "해당 기간에 뉴스가 없는 이유 (소형주, 거래량 부족, 특별한 이슈 없음 등)"
          }
  
          ❌ 만약 최근 3일간 뉴스가 없다면:
          {
            "companyName": "회사명",
            "ticker": "${qry}",
            "analysisDate": "${todayStr}",
            "analysisperiod": "${threeDaysAgoStr} ~ ${todayStr}",
            "hasRecentNews": false,
            "dataAvailability": {
              "newsCount": 0,
              "sourcesWithData": [],
              "coverage": "없음"
            },
            "overallSentiment": {
              "score": 2,
              "rating": "부정적 (뉴스 부재 악재)",
              "summary_kr": "최근 3일간 해당 종목 관련 뉴스가 없어 투자 관심이 낮거나 특별 이슈가 없는 상태로 판단됩니다.",
              "keyFactors": []
            },
            "newsAnalysis": [],
            "noNewsReason": "최근 3일간 관련 뉴스 없음"
          }`,
      ],
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const result = extractJsonFromMarkdown(response.text || "");

    // 추가 검증: 뉴스가 없는 경우 명확히 처리
    if (result && !result.hasRecentNews) {
      return NextResponse.json(
        {
          ...result,
          message: "최근 뉴스 데이터가 없어 분석을 수행할 수 없습니다.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900", // 더 짧은 캐시
          },
        }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=86400",
        "Vercel-CDN-Cache-Control": "public, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    console.error("뉴스 분석 API 오류:", error);
    return NextResponse.json(
      { error: "뉴스 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
