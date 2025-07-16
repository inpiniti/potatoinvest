import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
    console.error('JSON 파싱 오류:', error);
    return { error: 'JSON 파싱 실패', rawResponse: text };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qry = searchParams.get('qry');

    if (!qry) {
      return NextResponse.json(
        { error: '종목코드(qry) 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 현재 날짜에서 3일 전 계산
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        `당신은 전문 금융 뉴스 분석가 AI입니다. 종목코드 ${qry}의 최근 2-3일간 뉴스를 분석하여 호재/악재를 판단하고 JSON 형식으로만 응답하세요.

        다음 뉴스 사이트들에서 ${qry} 관련 최근 뉴스를 검색하고 분석해주세요:
        
        https://finance.yahoo.com/quote/${qry}/news/
        https://www.marketwatch.com/investing/stock/${qry}?mod=mw_quote_tab
        https://seekingalpha.com/symbol/${qry}/news
        https://www.cnbc.com/quotes/${qry}
        https://www.bloomberg.com/quote/${qry}:US
        https://www.reuters.com/markets/companies/${qry}/
        https://finviz.com/quote.ashx?t=${qry}
        https://www.benzinga.com/quote/${qry}
        https://www.fool.com/quote/${qry}/

        검색 기간: ${threeDaysAgoStr} ~ ${todayStr} (최근 3일)

        다음 JSON 구조로만 응답하세요:
        {
          "companyName": "회사명",
          "ticker": "${qry}",
          "analysisDate": "${todayStr}",
          "analysisperiod": "${threeDaysAgoStr} ~ ${todayStr}",
          "overallSentiment": {
            "score": 3.2,
            "rating": "중립",
            "scoreMeaning": {
              "5": "매우 긍정적 (강한 호재)",
              "4": "긍정적 (호재)",
              "3": "중립",
              "2": "부정적 (악재)",
              "1": "매우 부정적 (강한 악재)"
            },
            "summary_kr": "최근 뉴스 종합 분석 요약",
            "keyFactors": [
              "주요 호재/악재 요인 1",
              "주요 호재/악재 요인 2"
            ]
          },
          "newsAnalysis": [
            {
              "source": "Yahoo Finance",
              "headline": "뉴스 헤드라인",
              "publishDate": "2025-01-15",
              "sentimentScore": 4,
              "impact": "호재",
              "category": "실적발표/인수합병/신제품/규제/기타",
              "summary_kr": "뉴스 내용 요약",
              "reasoning_kr": "호재/악재 판단 근거",
              "url": "실제 뉴스 URL",
              "importance": "높음/중간/낮음"
            }
          ],
          "sentimentTrend": {
            "day1": 3.5,
            "day2": 3.2,
            "day3": 3.8,
            "trend": "상승/하락/횡보",
            "volatility": "높음/중간/낮음"
          },
          "marketImpact": {
            "expectedPriceImpact": "+2.5%",
            "confidenceLevel": "중간",
            "timeframe": "단기/중기/장기",
            "riskFactors": [
              "주의해야 할 리스크 요인들"
            ]
          },
          "recommendation": {
            "action": "매수/보유/매도/관망",
            "reasoning_kr": "추천 근거",
            "targetPeriod": "1주일",
            "confidence": "높음/중간/낮음"
          }
        }`,
      ],
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
        temperature: 0.3,
      },
    });

    return NextResponse.json(extractJsonFromMarkdown(response.text || ''), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=1800',
      },
    });
  } catch (error: unknown) {
    console.error('뉴스 분석 API 오류:', error);
    return NextResponse.json(
      { error: '뉴스 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
