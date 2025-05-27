import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 심볼과 지수 이름 매핑
    const symbolsMap = {
      "^IXIC": "나스닥 종합",
      "^GSPC": "S&P 500",
      "NQ=F": "나스닥 선물",
    };

    const symbols = Object.keys(symbolsMap);

    const promises = symbols.map((symbol) =>
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
        .then((res) => res.json())
        .then((data) => ({ symbol: symbol as keyof typeof symbolsMap, data }))
    );

    const results = await Promise.all(promises);

    // indicators 초기값 정의
    const indicators = [
      { type: "나스닥 종합", value: "0", change: "0" },
      { type: "S&P 500", value: "0", change: "0" },
      { type: "나스닥 선물", value: "0", change: "0" },
    ];

    // 모든 결과 처리
    results.forEach(({ symbol, data }) => {
      if (data?.chart?.result?.[0]) {
        const marketData = data.chart.result[0];
        const currentPrice = marketData.meta.regularMarketPrice;
        const previousClose = marketData.meta.previousClose || currentPrice;
        const change = (
          ((currentPrice - previousClose) / previousClose) *
          100
        ).toFixed(2);

        // 해당 지수 찾기
        const indexType = symbolsMap[symbol as keyof typeof symbolsMap];
        const indexPosition = indicators.findIndex(
          (item) => item.type === indexType
        );

        if (indexPosition !== -1) {
          indicators[indexPosition] = {
            ...indicators[indexPosition],
            value: currentPrice.toLocaleString(),
            change: change,
          };
        }
      }
    });

    // 디버그를 위한 콘솔 로그 추가
    console.log("처리된 지표 데이터:", indicators);

    return NextResponse.json(indicators);
  } catch (error) {
    console.error("시장 지표 가져오기 실패:", error);
    return NextResponse.json(
      { error: "Failed to fetch market indices" },
      { status: 500 }
    );
  }
}
