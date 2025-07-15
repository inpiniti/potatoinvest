import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// JSON 추출 함수 추가
// function extractJsonFromMarkdown(text: string) {
//   try {
//     // ```json ... ``` 형태에서 JSON 추출
//     const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//     if (jsonMatch) {
//       return JSON.parse(jsonMatch[1]);
//     }

//     // 마크다운 코드 블록이 없다면 전체 텍스트를 JSON으로 파싱 시도
//     return JSON.parse(text);
//   } catch (error) {
//     console.error('JSON 파싱 오류:', error);
//     // 파싱 실패시 원본 텍스트 반환
//     return { error: 'JSON 파싱 실패', rawResponse: text };
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qry = searchParams.get('qry');

    if (!qry) {
      return NextResponse.json(
        { error: '질문(qry) 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        `다음 사이트들에서 나스닥 종목코드 ${qry}의 정보를 분석해서, 목표주가, 애널리스트의 수, 가치편차 분석, 컨센서스 등을 알려주고, 원문링크도 같이 표기해줘
        
        https://www.marketbeat.com
        https://www.barchart.com
        https://www.tipranks.com
        https://www.zacks.com
        https://finance.yahoo.com
        https://www.marketwatch.com
        https://valueinvesting.io
        https://www.stockinvest.us
        https://www.morningstar.com

        답변을 json 형태로 정형화 해서 작성해줘
        `,
      ],
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
      },
    });

    return NextResponse.json(response.text, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=1800',
      },
    });
  } catch (error: unknown) {
    console.error('Gemini API 오류:', error);
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
