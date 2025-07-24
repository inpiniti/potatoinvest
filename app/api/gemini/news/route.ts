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

    // 모델은 총 5가지이다. 횟수는 다음과 같다.
    // 1. gemini-2.5-pro : 100
    // 2. gemini-2.5-flash : 250
    // 3. gemini-2.5-flash-lite : 1000
    // 4. gemini-2.0-flash : 200
    // 5. gemini-2.0-flash-lite : 200

    // 랜덤으로 모델을 선택하게 해야 되는데,
    // 비율을 2:5:20:4:4 으로 설정한다.
    // 랜덤으로 만들어주는 함수
    function getRandomModel() {
      const models = [
        { name: "gemini-2.5-pro", weight: 2 },
        { name: "gemini-2.5-flash", weight: 5 },
        { name: "gemini-2.5-flash-lite", weight: 20 },
        { name: "gemini-2.0-flash", weight: 4 },
        { name: "gemini-2.0-flash-lite", weight: 4 },
      ];

      const totalWeight = models.reduce((sum, model) => sum + model.weight, 0);
      const random = Math.random() * totalWeight;

      let cumulativeWeight = 0;
      for (const model of models) {
        cumulativeWeight += model.weight;
        if (random < cumulativeWeight) {
          return model.name;
        }
      }

      return models[0].name; // 기본값
    }

    const model = getRandomModel();

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        `당신은 전문 금융 뉴스 분석가 AI입니다. 종목코드 ${qry}의 최근 일주일간 뉴스를 분석하여 호재/악재를 판단하고 JSON 형식으로만 응답하세요.
  
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
          
          ⚠️ 분석 시 주의사항:
          • 각 뉴스 출처의 신뢰도를 고려하여 가중치를 적용하세요:
            - 높은 신뢰도: Bloomberg, Reuters, Barron's, CNBC
            - 중간 신뢰도: Yahoo Finance, MarketWatch, Nasdaq, Business Insider
            - 낮은 신뢰도: Seeking Alpha, Benzinga, Finviz, The Motley Fool, Investing.com
          • 동일한 뉴스(제목/링크)가 여러 사이트에 중복 게재된 경우 중복 제거 후 분석하세요
          • 반드시 최근 3일 이내 뉴스만 분석하세요
          • newsAnalysis에는 각 뉴스별 주요 키워드와 긍정/부정 판단의 구체적 근거 문장을 포함하세요
  
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
            "newsAnalysis": [
              {
                "title": "뉴스 제목",
                "url": "뉴스 링크",
                "source": "출처",
                "publishDate": "발행일자",
                "sentiment": "긍정/부정/중립",
                "keywords": ["키워드1", "키워드2"],
                "reasoning": "긍정/부정 판단의 구체적 근거 문장",
                "reliability": "높음/중간/낮음"
              }
            ],
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
              "summary_kr": "최근 3일간 관련 뉴스가 없어 투자자 관심도가 낮은 상황입니다. 다만 소형주나 거래량이 적은 종목의 경우 정상적인 현상일 수 있습니다.",
              "keyFactors": ["뉴스 부재", "투자자 관심도 저조"]
            },
            "newsAnalysis": [],
            "noNewsReason": "최근 3일간 관련 뉴스 없음 (소형주나 저거래량 종목의 경우 정상적 현상일 수 있음)"
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
          model,
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

    return NextResponse.json(
      {
        result,
        model,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=86400",
          "Vercel-CDN-Cache-Control": "public, s-maxage=86400",
        },
      }
    );
  } catch (error: unknown) {
    console.error("뉴스 분석 API 오류:", error);
    return NextResponse.json(
      { error: "뉴스 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
