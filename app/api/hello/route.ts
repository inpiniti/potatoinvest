import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await crawling("us");
    return NextResponse.json(res, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        "CDN-Cache-Control": "public, s-maxage=60",
        "Vercel-CDN-Cache-Control": "public, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

type CodeList = {
  [key: string]: {
    name: string;
    kr: string;
    countryId?: number;
    pageSize?: number;
  };
};

const codeList: CodeList = {
  il: { name: "israel", kr: "이스라엘" },
  br: {
    name: "brazil",
    kr: "브라질",
    countryId: 32,
    pageSize: 1406,
  },
  fr: { name: "france", kr: "프랑스" },
  hk: { name: "hong", kr: "홍콩" },
  be: { name: "belgium", kr: "벨기에" },
  fi: { name: "finland", kr: "핀란드" },
  it: { name: "italy", kr: "이탈리아" },
  se: { name: "sweden", kr: "스웨덴" },
  sg: { name: "singapore", kr: "싱가포르" },
  nl: { name: "netherlands", kr: "네덜란드", countryId: 21, pageSize: 200 },
  ch: { name: "switzerland", kr: "스위스" },
  cl: { name: "chile", kr: "칠레", countryId: 27, pageSize: 200 },
  ca: { name: "canada", kr: "캐나다", countryId: 6, pageSize: 5000 },
  de: { name: "germany", kr: "독일", countryId: 17, pageSize: 6000 },
  ie: { name: "ireland", kr: "아일랜드" },
  no: { name: "norway", kr: "노르웨이", countryId: 60, pageSize: 400 },
  dk: { name: "denmark", kr: "덴마크", countryId: 24, pageSize: 200 },
  pt: { name: "portugal", kr: "포르투갈" },
  es: { name: "spain", kr: "스페인" },
  uk: { name: "united", kr: "영국" },
  co: { name: "colombia", kr: "콜롬비아", countryId: 122, pageSize: 100 },
  cz: { name: "czech", kr: "체코" },
  gr: { name: "greece", kr: "그리스", countryId: 51, pageSize: 200 },
  eg: { name: "egypt", kr: "이집트" },
  hu: { name: "hungary", kr: "헝가리" },
  in: { name: "india", kr: "인도" },
  id: { name: "indonesia", kr: "인도네시아" },
  kr: { name: "korea", kr: "한국", countryId: 11, pageSize: 3000 },
  my: { name: "malaysia", kr: "말레이시아" },
  mx: { name: "mexico", kr: "멕시코", countryId: 7, pageSize: 800 },
  pe: { name: "peru", kr: "페루", countryId: 125, pageSize: 300 },
  ph: { name: "philippines", kr: "필리핀" },
  pl: { name: "poland", kr: "폴란드" },
  th: { name: "thailand", kr: "태국" },
  tr: { name: "turkey", kr: "터키" },
  ar: {
    name: "argentina",
    kr: "아르헨티나",
    countryId: 29,
    pageSize: 400,
  },
  jo: { name: "jordan", kr: "요르단" },
  ma: { name: "morocco", kr: "모로코" },
  om: { name: "oman", kr: "오만" },
  pk: { name: "pakistan", kr: "파키스탄" },
  qa: { name: "qatar", kr: "카타르" },
  lk: { name: "sri", kr: "스리랑카" },
  au: { name: "australia", kr: "호주" },
  cn: { name: "china", kr: "중국", countryId: 37, pageSize: 6000 },
  jp: { name: "japan", kr: "일본", countryId: 35, pageSize: 5000 },
  us: { name: "america", kr: "미국", countryId: 5, pageSize: 0 },
  at: { name: "austria", kr: "오스트리아" },
  cy: { name: "cyprus", kr: "키프로스" },
  tw: { name: "taiwan", kr: "대만" },
  jm: { name: "jamaica", kr: "자메이카", countryId: 119, pageSize: 100 },
  ve: { name: "venezuela", kr: "베네수엘라", countryId: 138, pageSize: 100 },
  cr: { name: "costarica", kr: "코스타리카", countryId: 15, pageSize: 100 },
  lv: { name: "latvia", kr: "라트비아", countryId: 97, pageSize: 100 },
  ru: { name: "russia", kr: "러시아", countryId: 56, pageSize: 300 },
  ro: { name: "romania", kr: "루마니아", countryId: 100, pageSize: 300 },
  lu: { name: "luxembourg", kr: "룩셈부르크", countryId: 103, pageSize: 100 },
  lt: { name: "lithuania", kr: "리투아니아", countryId: 96, pageSize: 100 },
  me: { name: "moNTENEGRO", kr: "몬테네그로", countryId: 247, pageSize: 100 },
};

// us, kr
const crawling = async (countryCode: string) => {
  try {
    // url https://scanner.tradingview.com/korea/scan
    // 메서드 POST

    const 분석용 = [
      "name",
      "description",
      "logoid",
      "operating_margin_ttm",
      "relative_volume_10d_calc",
      "enterprise_value_to_revenue_ttm",
      "Volatility.W", //"volatility_w",
      "Volatility.M", //"volatility_m",
      "dividends_yield_current",
      "gap",
      "volume_change",
      "pre_tax_margin_ttm",
      // "perf_1_y_market_cap",
      // "perf_w",
      // "perf_1_m",
      // "perf_3_m",
      // "perf_6_m",
      // "perf_y_t_d",
      // "perf_y",
      // "perf_5_y",
      // "perf_10_y",
      "Perf.1Y.MarketCap",
      "Perf.W", // 주간 성과
      "Perf.1M", // 1개월 성과
      "Perf.3M", // 3개월 성과
      "Perf.6M", // 6개월 성과
      "Perf.YTD", // 연초부터 현재까지의 성과
      "Perf.Y", // 1년 성과
      "Perf.5Y", // 5년 성과
      "Perf.10Y", // 10년 성과
      "Perf.All", // 전체 성과

      // "recommend_all",
      // "recommend_m_a",
      // "recommend_other",
      "Recommend.All", // 모든 추천
      "Recommend.MA", // 이동 평균 추천
      "Recommend.Other", // 기타 추천

      // "r_s_i",
      // "mom",
      "RSI", // 상대 강도 지수
      "Mom", // 모멘텀

      // "c_c_i20",
      // "stoch_k",
      // "stoch_d",
      "CCI20", // 상품 채널 지수 20
      "Stoch.K", // 스토캐스틱 K
      "Stoch.D", // 스토캐스틱 D

      "close", // 종가
      "change", // 변화
      "market",
    ];

    // const 오버뷰 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "close", // 종가
    //   "pricescale", // 가격 척도
    //   "minmov", // 최소 이동
    //   "fractional", // 분수
    //   "minmove2", // 최소 이동 2
    //   "currency", // 통화
    //   "change", // 변화
    //   "volume", // 거래량
    //   "relative_volume_10d_calc", // 10일 상대 거래량 계산
    //   "market_cap_basic", // 기본 시장 규모
    //   "fundamental_currency_code", // 기본 통화 코드
    //   "price_earnings_ttm", // 시가 총액 대비 이익(TTM)
    //   "earnings_per_share_diluted_ttm", // 주당 순이익(TTM, 희석)
    //   "earnings_per_share_diluted_yoy_growth_ttm", // 주당 순이익 연간 성장률(TTM, 희석)
    //   "dividends_yield_current", // 현재 배당 수익률
    //   "sector.tr", // TR 섹터
    //   "market", // 시장
    //   "sector", // 섹터
    //   "recommendation_mark", // 추천 마크
    //   "exchange", // 거래소
    // ];
    // const 성과 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "close", // 종가
    //   "pricescale", // 가격 척도
    //   "minmov", // 최소 이동
    //   "fractional", // 분수
    //   "minmove2", // 최소 이동 2
    //   "currency", // 통화
    //   "change", // 변화
    //   "Perf.W", // 주간 성과
    //   "Perf.1M", // 1개월 성과
    //   "Perf.3M", // 3개월 성과
    //   "Perf.6M", // 6개월 성과
    //   "Perf.YTD", // 연초부터 현재까지의 성과
    //   "Perf.Y", // 1년 성과
    //   "Perf.5Y", // 5년 성과
    //   "Perf.10Y", // 10년 성과
    //   "Perf.All", // 전체 성과
    //   "Volatility.W", // 주간 변동성
    //   "Volatility.M", // 월간 변동성
    //   "exchange", // 거래소
    // ];
    // const 시간외 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "premarket_close", // 시장 개장 전 종가
    //   "pricescale", // 가격 척도
    //   "minmov", // 최소 이동
    //   "fractional", // 분수
    //   "minmove2", // 최소 이동 2
    //   "currency", // 통화
    //   "close", // 종가
    //   "change", // 변화
    //   "gap", // 갭
    //   "volume", // 거래량
    //   "volume_change", // 거래량 변동
    //   "exchange", // 거래소
    // ];
    // const 평가 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "market_cap_basic", // 기본 시장 규모
    //   "fundamental_currency_code", // 기본 통화 코드
    //   "Perf.1Y.MarketCap", // 1년 시장 규모 성과
    //   "price_earnings_ttm", // 시가 총액 대비 이익(TTM)
    //   "price_earnings_growth_ttm", // 시가 총액 대비 이익 성장(TTM)
    //   "price_sales_current", // 현재 매출 대비 가격
    //   "price_book_fq", // 분기별 자산 대비 가격
    //   "price_to_cash_f_operating_activities_ttm", // 영업 활동으로 인한 현금 흐름 대비 가격(TTM)
    //   "price_free_cash_flow_ttm", // 자유 현금 흐름 대비 가격(TTM)
    //   "price_to_cash_ratio", // 현금 대비 가격 비율
    //   "enterprise_value_current", // 현재 기업 가치
    //   "enterprise_value_to_revenue_ttm", // 수익 대비 기업 가치(TTM)
    //   "enterprise_value_to_ebit_ttm", // EBIT 대비 기업 가치(TTM)
    //   "enterprise_value_ebitda_ttm", // EBITDA 대비 기업 가치(TTM)
    //   "exchange", // 거래소
    // ];
    // const 배당 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "dps_common_stock_prim_issue_fy", // 주식 기본 발행 DPS(연간)
    //   "fundamental_currency_code", // 기본 통화 코드
    //   "dividends_yield_current", // 현재 배당 수익률
    //   "dividends_yield", // 배당 수익률
    //   "dividend_payout_ratio_ttm", // 배당 지급 비율(TTM)
    //   "dps_common_stock_prim_issue_yoy_growth_fy", // 주식 기본 발행 DPS 연간 성장률(FY)
    //   "continuous_dividend_payout", // 연속 배당 지급
    //   "continuous_dividend_growth", // 연속 배당 성장
    //   "exchange", // 거래소
    // ];
    // const 수익성 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "gross_margin_ttm", // 총 마진(TTM)
    //   "operating_margin_ttm", // 운영 마진(TTM)
    //   "pre_tax_margin_ttm", // 세전 마진(TTM)
    //   "net_margin_ttm", // 순 마진(TTM)
    //   "free_cash_flow_margin_ttm", // 자유 현금 흐름 마진(TTM)
    //   "return_on_assets_fq", // 자산 대비 수익률(분기별)
    //   "return_on_equity_fq", // 자본 대비 수익률(분기별)
    //   "return_on_invested_capital_fq", // 투자된 자본 대비 수익률(분기별)
    //   "research_and_dev_ratio_ttm", // 연구 개발 비율(TTM)
    //   "sell_gen_admin_exp_other_ratio_ttm", // 판매, 일반 및 관리 비용 비율(TTM)
    //   "exchange", // 거래소
    // ];
    // const 손익계산 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "gross_margin_ttm", // 총 마진(TTM)
    //   "operating_margin_ttm", // 운영 마진(TTM)
    //   "pre_tax_margin_ttm", // 세전 마진(TTM)
    //   "net_margin_ttm", // 순 마진(TTM)
    //   "free_cash_flow_margin_ttm", // 자유 현금 흐름 마진(TTM)
    //   "return_on_assets_fq", // 자산 대비 수익률(분기별)
    //   "return_on_equity_fq", // 자본 대비 수익률(분기별)
    //   "return_on_invested_capital_fq", // 투자된 자본 대비 수익률(분기별)
    //   "research_and_dev_ratio_ttm", // 연구 개발 비율(TTM)
    //   "sell_gen_admin_exp_other_ratio_ttm", // 판매, 일반 및 관리 비용 비율(TTM)
    //   "exchange", // 거래소
    // ];
    // const 대차대조표 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "total_assets_fq", // 총 자산(분기별)
    //   "fundamental_currency_code", // 기본 통화 코드
    //   "total_current_assets_fq", // 총 유동 자산(분기별)
    //   "cash_n_short_term_invest_fq", // 현금 및 단기 투자(분기별)
    //   "total_liabilities_fq", // 총 부채(분기별)
    //   "total_debt_fq", // 총 부채(분기별)
    //   "net_debt_fq", // 순 부채(분기별)
    //   "total_equity_fq", // 총 자본(분기별)
    //   "current_ratio_fq", // 유동비율(분기별)
    //   "quick_ratio_fq", // 당좌비율(분기별)
    //   "debt_to_equity_fq", // 부채 대 자본 비율(분기별)
    //   "cash_n_short_term_invest_to_total_debt_fq", // 현금 및 단기 투자 대 총 부채 비율(분기별)
    //   "exchange", // 거래소
    // ];
    // const 현금흐름 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "cash_f_operating_activities_ttm", // 운영 활동으로 인한 현금 흐름(TTM)
    //   "fundamental_currency_code", // 기본 통화 코드
    //   "cash_f_investing_activities_ttm", // 투자 활동으로 인한 현금 흐름(TTM)
    //   "cash_f_financing_activities_ttm", // 재무 활동으로 인한 현금 흐름(TTM)
    //   "free_cash_flow_ttm", // 자유 현금 흐름(TTM)
    //   "capital_expenditures_ttm", // 자본 지출(TTM)
    //   "exchange", // 거래소
    // ];
    // const 테크니컬즈 = [
    //   "name", // 이름
    //   "description", // 설명
    //   "logoid", // 로고 ID
    //   "update_mode", // 업데이트 모드
    //   "type", // 유형
    //   "Recommend.All", // 모든 추천
    //   "Recommend.MA", // 이동 평균 추천
    //   "Recommend.Other", // 기타 추천
    //   "RSI", // 상대 강도 지수
    //   "Mom", // 모멘텀
    //   "pricescale", // 가격 척도
    //   "minmov", // 최소 이동
    //   "fractional", // 분수
    //   "minmove2", // 최소 이동 2
    //   "AO", // 놀람의 오실레이터
    //   "CCI20", // 상품 채널 지수 20
    //   "Stoch.K", // 스토캐스틱 K
    //   "Stoch.D", // 스토캐스틱 D
    //   "exchange", // 거래소
    // ];

    const columns: string[] = Array.from(
      new Set([
        // ...오버뷰,
        // ...성과,
        // ...시간외,
        // ...평가,
        // ...배당,
        // ...손익계산,
        // ...대차대조표,
        // ...현금흐름,
        // ...테크니컬즈,
        // ...수익성,
        ...분석용,
      ])
    );

    const response = await fetch(
      `https://scanner.tradingview.com/${codeList[countryCode].name}/scan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columns: columns,
          ignore_unknown_fields: false,
          options: { lang: "ko" },
          range: [0, 99999],
          sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
          symbols: {},
          markets: ["america"],
          filter: [
            {
              left: "exchange",
              operation: "in_range",
              right: ["NASDAQ"],
            },
          ],
          filter2: {
            operator: "and",
            operands: [
              {
                operation: {
                  operator: "or",
                  operands: [
                    {
                      operation: {
                        operator: "and",
                        operands: [
                          {
                            expression: {
                              left: "type",
                              operation: "equal",
                              right: "stock",
                            },
                          },
                          {
                            expression: {
                              left: "typespecs",
                              operation: "has",
                              right: ["common"],
                            },
                          },
                        ],
                      },
                    },
                    {
                      operation: {
                        operator: "and",
                        operands: [
                          {
                            expression: {
                              left: "type",
                              operation: "equal",
                              right: "stock",
                            },
                          },
                          {
                            expression: {
                              left: "typespecs",
                              operation: "has",
                              right: ["preferred"],
                            },
                          },
                        ],
                      },
                    },
                    {
                      operation: {
                        operator: "and",
                        operands: [
                          {
                            expression: {
                              left: "type",
                              operation: "equal",
                              right: "dr",
                            },
                          },
                        ],
                      },
                    },
                    {
                      operation: {
                        operator: "and",
                        operands: [
                          {
                            expression: {
                              left: "type",
                              operation: "equal",
                              right: "fund",
                            },
                          },
                          {
                            expression: {
                              left: "typespecs",
                              operation: "has_none_of",
                              right: ["etf"],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();

    const data = responseJson.data.map((item: { d: unknown[] }) => {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = item.d[i];
      }
      return obj;
    });

    return data.map((item: Record<string, unknown>) => toSnakeCase(item));
  } catch (error) {
    console.error("error014", error);
    throw error;
  }
};

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    let snakeCaseKey = key
      .replace(/\.+/g, "_") // Replace dots with underscores
      .replace(/([A-Z])/g, "_$1") // Prefix uppercase letters with an underscore
      .toLowerCase() // Convert to lowercase
      .replace(/__+/g, "_"); // Replace double underscores with a single underscore

    // Remove leading underscore if it's the first character
    snakeCaseKey = snakeCaseKey.startsWith("_")
      ? snakeCaseKey.substring(1)
      : snakeCaseKey;

    newObj[snakeCaseKey] = obj[key];
  });
  return newObj;
}
