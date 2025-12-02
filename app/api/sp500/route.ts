import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/**
 * S&P 500 종목 리스트 조회 API
 * Wikipedia에서 S&P 500 구성 종목을 크롤링하여 반환합니다.
 */
export async function GET() {
    try {
        // Wikipedia S&P 500 페이지에서 데이터 가져오기
        const response = await fetch(
            "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies",
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch S&P 500 data from Wikipedia: ${response.status}`);
        }

        const html = await response.text();

        // cheerio로 HTML 파싱
        const $ = cheerio.load(html);
        const stocks: Array<{
            symbol: string;
            name: string;
            exchange: string;
        }> = [];

        // 첫 번째 테이블(S&P 500 구성 종목 테이블) 찾기
        const table = $("#constituents").first();

        // 테이블의 각 행 순회 (헤더 제외)
        table.find("tbody tr").each((_, row) => {
            const cells = $(row).find("td");

            // 최소 2개의 셀이 있어야 함 (심볼, 이름)
            if (cells.length >= 2) {
                const symbol = $(cells[0]).text().trim();
                const name = $(cells[1]).text().trim();

                // 거래소 정보 추정 (심볼 기반)
                const exchange = getExchangeBySymbol(symbol);

                // 유효한 데이터만 추가
                if (symbol && name) {
                    stocks.push({
                        symbol,
                        name,
                        exchange,
                    });
                }
            }
        });

        return NextResponse.json({
            success: true,
            count: stocks.length,
            data: stocks,
        });
    } catch (error: unknown) {
        console.error("Error fetching S&P 500 list:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * 심볼 기반으로 거래소 추정
 * S&P 500 종목은 대부분 NYSE에 상장되어 있으며, 일부는 NASDAQ에 상장
 */
function getExchangeBySymbol(symbol: string): string {
    // NASDAQ에 상장된 주요 기술주들
    const nasdaqSymbols = [
        "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "NVDA", "META", "TSLA",
        "AVGO", "COST", "CSCO", "ADBE", "PEP", "NFLX", "CMCSA", "INTC",
        "AMD", "QCOM", "INTU", "AMGN", "AMAT", "ISRG", "BKNG", "ADP",
        "GILD", "MDLZ", "VRTX", "REGN", "LRCX", "PANW", "KLAC", "SNPS",
        "CDNS", "MRVL", "ASML", "ORLY", "CTAS", "ABNB", "WDAY", "MNST",
        "PCAR", "PAYX", "MCHP", "FAST", "ODFL", "DXCM", "ROST", "VRSK",
        "IDXX", "BIIB", "CTSH", "ANSS", "DLTR", "CPRT", "CSGP", "TEAM",
        "TTWO", "ZS", "DDOG", "CRWD", "FTNT", "CHTR", "NXPI", "MRNA"
    ];

    return nasdaqSymbols.includes(symbol) ? "NASDAQ" : "NYSE";
}
