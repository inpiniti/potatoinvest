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
    console.error("JSON 파싱 오류:", error);
    return { error: "JSON 파싱 실패", rawResponse: text };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticker, technicalData } = body;

    if (!ticker) {
      return NextResponse.json(
        { error: "종목코드(ticker) 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    if (!technicalData) {
      return NextResponse.json(
        { error: "기술적 지표 데이터(technicalData)가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 날짜
    const today = new Date().toISOString().split("T")[0];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `당신은 전문 테크니컬 분석가 AI입니다. 제공된 기술적 지표 데이터를 분석하여 종목의 기술적 분석 결과를 JSON 형식으로만 응답하세요.

        종목코드: ${ticker}
        분석일자: ${today}

        제공된 기술적 지표 데이터:
        ${JSON.stringify(technicalData, null, 2)}

        각 지표의 의미:
        - Recommend.All: 모든 추천 종합 신호 (0.5575757575757576) (-1 ~ 1)
        - Recommend.MA: 이동평균 추천 신호 (0.9333333333333333) (-1 ~ 1)
        - Recommend.Other: 기타 기술적 추천 신호 (0.18181818181818182) (-1 ~ 0.5)
        - RSI: 상대강도지수 (0-100, 70이상 과매수, 30이하 과매도) (78.31190377601266)
        - Mom: 모멘텀 지표 (12.70999999999998) (-223 ~ 124)
        - AO: Awesome Oscillator (놀라운 오실레이터) (16.192454411764686) (-85 ~ 186)
        - CCI20: Commodity Channel Index 20일 (155.62842199716636) (-398 ~ 640)
        - Stoch.K: 스토캐스틱 K값 (88.0357690592848) (0 ~ 100)
        - Stoch.D: 스토캐스틱 D값 (90.40421204083736) (0 ~ 100)
        - pricescale (100) (100 ~ 10000)

        다음 JSON 구조로만 응답하세요:
        {
          "companyName": "회사명 (추정)",
          "ticker": "${ticker}",
          "analysisDate": "${today}",
          "technicalScore": {
            "overallScore": 3.8,
            "scoreBreakdown": {
              "trend": 4.2,
              "momentum": 3.5,
              "volatility": 3.0,
              "volume": 4.0,
              "support_resistance": 3.8
            },
            "recommendation": "매수",
            "confidence": "높음",
            "scoreMeaning": {
              "5": "강력 매수",
              "4": "매수",
              "3": "중립",
              "2": "매도", 
              "1": "강력 매도"
            }
          },
          "indicatorAnalysis": [
            {
              "indicator": "RSI",
              "value": "45.2",
              "signal": "중립",
              "score": 3,
              "interpretation": "RSI가 중립권에서 거래되고 있어 과매수/과매도 상태가 아님",
              "reasoning": "RSI 45.2는 30-70 중립권에 위치하여 추가 상승/하락 여력이 있음"
            },
            {
              "indicator": "이동평균(MA)",
              "value": "매수",
              "signal": "매수",
              "score": 4,
              "interpretation": "단기/장기 이동평균이 상승 신호를 보임",
              "reasoning": "현재가가 주요 이동평균선 위에 위치하고 골든크로스 패턴 형성"
            },
            {
              "indicator": "스토캐스틱",
              "value": "K:65, D:62",
              "signal": "매수",
              "score": 4,
              "interpretation": "스토캐스틱이 상승 모멘텀을 보이며 매수 신호",
              "reasoning": "K선이 D선을 상향돌파하며 과매도권에서 벗어나는 상승 신호"
            }
          ],
          "keyFindings": {
            "bullishSignals": [
              "이동평균선 상향돌파",
              "스토캐스틱 매수 신호",
              "모멘텀 지표 개선"
            ],
            "bearishSignals": [
              "거래량 부족",
              "상승 저항선 근접"
            ],
            "neutralFactors": [
              "RSI 중립권 유지",
              "변동성 보통 수준"
            ]
          },
          "tradingStrategy": {
            "entryStrategy": "현재 수준에서 분할 매수 추천",
            "exitStrategy": "목표가 달성 시 분할 매도",
            "stopLoss": "주요 지지선 하향 돌파 시",
            "targetPrice": "다음 저항선까지 5-8% 상승 여력",
            "timeFrame": "단기 (1-2주)",
            "riskLevel": "중간"
          },
          "marketCondition": {
            "trend": "상승 추세",
            "strength": "보통",
            "phase": "상승 초기/중기/후기",
            "volatility": "보통",
            "summary_kr": "현재 기술적 상황 종합 요약"
          },
          "alerts": [
            "주요 저항선 돌파 시 추가 상승 기대",
            "거래량 증가 여부 모니터링 필요"
          ],
          "conclusion": {
            "shortTerm": "단기적으로 상승 가능성 높음",
            "mediumTerm": "중기적으로 횡보 예상",
            "reasoning_kr": "종합 판단 근거 및 투자 방향성 제시"
          }
        }`,
      ],
      config: {
        temperature: 0.2,
      },
    });

    return NextResponse.json(extractJsonFromMarkdown(response.text || ""), {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=900",
      },
    });
  } catch (error: unknown) {
    console.error("테크니컬 분석 API 오류:", error);
    return NextResponse.json(
      { error: "테크니컬 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 사용 예시
// const technicalData = {
//   "Recommend.All": "BUY",
//   "Recommend.MA": "BUY",
//   "Recommend.Other": "NEUTRAL",
//   "RSI": 45.2,
//   "Mom": 1.25,
//   "AO": 0.45,
//   "CCI20": -25.3,
//   "Stoch.K": 65.2,
//   "Stoch.D": 62.1,
//   "pricescale": 100,
//   "minmov": 1
// };

// const response = await fetch('/api/gemini/technical', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     ticker: 'AAPL',
//     technicalData: technicalData
//   })
// });
