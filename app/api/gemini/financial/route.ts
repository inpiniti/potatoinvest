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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        `당신은 전문 재무분석가 AI입니다. 종목코드 ${qry}의 재무제표 정보를 다음 사이트들에서 분석하고 JSON 형식으로만 응답하세요.

        분석할 재무제표 사이트들:
        https://finance.yahoo.com/quote/${qry}/financials/
        https://www.marketwatch.com/investing/stock/${qry}/financials
        https://seekingalpha.com/symbol/${qry}/income-statement
        https://www.morningstar.com/stocks/xnas/${qry}/financials
        https://www.sec.gov/edgar/search/#/q=${qry}
        https://finviz.com/quote.ashx?t=${qry}
        https://www.gurufocus.com/stock/${qry}/summary
        https://www.macrotrends.net/stocks/charts/${qry}/financials

        다음 JSON 구조로만 응답하세요:
        {
          "companyName": "회사명",
          "ticker": "${qry}",
          "analysisDate": "2025-01-15",
          "financialHealth": {
            "overallScore": 7.5,
            "scoreBreakdown": {
              "profitability": 8.0,
              "liquidity": 7.0,
              "solvency": 7.5,
              "efficiency": 8.0,
              "growth": 7.0
            },
            "riskLevel": "중간",
            "conclusion_kr": "재무 건전성 종합 평가"
          },
          "keyMetrics": {
            "revenue": {
              "current": "1.2B",
              "growth": "15.2%",
              "trend": "증가"
            },
            "netIncome": {
              "current": "150M",
              "growth": "25.3%",
              "trend": "증가"
            },
            "cashFlow": {
              "operating": "180M",
              "free": "120M",
              "trend": "안정"
            },
            "debtToEquity": {
              "ratio": "0.35",
              "status": "양호"
            },
            "roe": "18.5%",
            "roa": "12.3%",
            "grossMargin": "45.2%",
            "operatingMargin": "18.7%"
          },
          "analysisBySource": [
            {
              "source": "Yahoo Finance",
              "profitabilityScore": 8,
              "liquidityScore": 7,
              "growthScore": 8,
              "summary_kr": "Yahoo Finance 재무제표 분석 요약",
              "url": "실제 URL",
              "keyHighlights": [
                "매출 성장률 지속 증가",
                "부채 비율 안정적"
              ]
            }
          ],
          "redFlags": [
            "높은 부채 비율",
            "현금흐름 감소"
          ],
          "strengths": [
            "강한 수익성",
            "안정적인 성장률"
          ],
          "recommendation": {
            "rating": "매수",
            "reasoning_kr": "추천 이유",
            "targetPrice": "$45.00",
            "timeHorizon": "12개월"
          }
        }`,
      ],
      config: {
        tools: [{ urlContext: {} }],
        temperature: 0.2,
      },
    });

    return NextResponse.json(extractJsonFromMarkdown(response.text || ''), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      },
    });
  } catch (error: unknown) {
    console.error('재무제표 분석 API 오류:', error);
    return NextResponse.json(
      { error: '재무제표 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
