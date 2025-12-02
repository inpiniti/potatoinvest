import dayjs from "dayjs";
import { NextResponse } from "next/server";

// 쿼리 파라미터에서 종목코드 배열 추출 (codes, symbols, tickers 모두 허용)
const parseCodesFromSearchParams = (searchParams) => {
    const keys = ["codes", "symbols", "tickers"];
    const raw = [];
    for (const k of keys) {
        // 반복 파라미터와 콤마 구분 모두 허용
        const values = searchParams.getAll(k);
        if (values && values.length) raw.push(...values);
    }
    if (raw.length === 0) return [];
    const list = raw
        .flatMap((v) => (typeof v === "string" ? v.split(",") : v))
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toUpperCase());
    // 중복 제거
    return Array.from(new Set(list));
};

// 종목코드 매칭 ("NASDAQ:AAPL" vs "AAPL" 모두 대응)
const isCodeMatched = (itemName, codesSet) => {
    if (!itemName) return false;
    const up = String(itemName).toUpperCase();
    if (codesSet.has(up)) return true;
    const base = up.includes(":") ? up.split(":").pop() : up;
    return codesSet.has(base);
};

export async function GET(req, { params }) {
    try {
        // market 파라미터 추출
        const market = params.market?.toLowerCase() || "nasdaq";

        // market_config.json 로드
        let marketConfig;
        try {
            const marketConfigJson = await import("@/json/market_config.json");
            marketConfig = marketConfigJson.default[market];

            if (!marketConfig) {
                return NextResponse.json(
                    { error: `지원하지 않는 마켓입니다: ${market}` },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error("market_config.json 로드 실패:", error);
            return NextResponse.json(
                { error: "마켓 설정 파일을 로드할 수 없습니다" },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(req.url);
        const codes = parseCodesFromSearchParams(searchParams); // 선택적 종목코드 리스트

        // 결과를 캐시하여 반복 요청 방지
        const headers = {
            "Cache-Control": "public, max-age=300, s-maxage=600", // 5분 캐시, CDN에서는 10분
            "CDN-Cache-Control": "public, s-maxage=300",
            "Vercel-CDN-Cache-Control": "public, s-maxage=300",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        console.log(dayjs().format("HH:mm:ss"), `[${market}] 크롤링 시작`);

        // 크롤링 데이터 가져오기 (marketConfig 전달)
        const rawData = await crawling(marketConfig);

        console.log(dayjs().format("HH:mm:ss"), `[${market}] 크롤링 완료: ${rawData.length}개 항목`);

        // codes가 제공된 경우, 해당 종목만 선별
        const targetData =
            Array.isArray(codes) && codes.length > 0
                ? rawData.filter((item) => isCodeMatched(item?.name, new Set(codes)))
                : rawData;

        // 기본 데이터 처리 (예측 기능 제거)
        const processedData = targetData.map((item) => ({
            ...item,
            type: "분석",
            processedAt: new Date().toISOString(),
        }));

        // --- DCF 계산 보조 함수 ---
        const toNum = (v) => {
            if (v == null) return NaN;
            if (typeof v === "number") return v;
            const s = String(v).replace(/,/g, "").replace(/\\s+/g, "");
            const n = Number(s);
            return isFinite(n) ? n : NaN;
        };

        const normalizeRate = (r) => {
            if (r == null) return NaN;
            const n = toNum(r);
            if (!isFinite(n)) return NaN;
            // If value looks like percent (>1 and <1000) treat as percent
            if (Math.abs(n) > 1 && Math.abs(n) < 1000) return n / 100;
            return n; // already fraction
        };

        const computeDCF = (item, opts = {}) => {
            // opts: years, discountRate, terminalGrowth
            const years = Number(opts.years ?? 5);
            const terminalGrowth =
                typeof opts.terminalGrowth === "number" ? opts.terminalGrowth : 0.02;
            const defaultDiscount =
                typeof opts.discountRate === "number" ? opts.discountRate : 0.1;

            // estimate current Free Cash Flow
            let fcf = toNum(item.free_cash_flow_ttm);
            if (!isFinite(fcf)) {
                const op = toNum(item.cash_f_operating_activities_ttm);
                const capex = toNum(item.capital_expenditures_ttm);
                if (isFinite(op) && isFinite(capex)) {
                    // capex often negative in source; use op - abs(capex)
                    fcf = op - Math.abs(capex);
                }
            }
            if (!isFinite(fcf) || fcf <= 0) return { intrinsic: null, inputs: null };

            // growth estimate from revenue yoy
            let g = normalizeRate(item.total_revenue_yoy_growth_ttm);
            if (!isFinite(g)) {
                const eg = normalizeRate(
                    item.earnings_per_share_diluted_yoy_growth_ttm
                );
                g = isFinite(eg) ? eg : 0.05; // fallback 5%
            }

            // discount rate (simple fallback)
            let r = normalizeRate(item.required_return || item.discount_rate || null);
            if (!isFinite(r)) {
                // try to infer from price_to_cash_ratio or enterprise_value_to_ebit_ttm
                const ptc = toNum(item.price_to_cash_ratio);
                const ev_ebit = toNum(item.enterprise_value_to_ebit_ttm);
                if (isFinite(ptc) && ptc > 0) {
                    // higher price-to-cash -> lower discount (simplified)
                    r = Math.min(0.25, Math.max(0.03, 0.15 - (ptc - 5) * 0.005));
                } else if (isFinite(ev_ebit) && ev_ebit > 0) {
                    r = Math.min(0.25, Math.max(0.04, 0.12 - (ev_ebit - 10) * 0.002));
                } else {
                    r = defaultDiscount;
                }
            }

            // Ensure sensible bounds
            if (r <= 0) r = defaultDiscount;
            if (g < -0.5) g = -0.5;

            // Project and discount
            let pvSum = 0;
            for (let t = 1; t <= years; t++) {
                const futureFcf = fcf * Math.pow(1 + g, t);
                pvSum += futureFcf / Math.pow(1 + r, t);
            }

            // terminal value using Gordon Growth
            const fcfAtN = fcf * Math.pow(1 + g, years);
            const tv = (fcfAtN * (1 + terminalGrowth)) / (r - terminalGrowth);
            const discountedTV = tv / Math.pow(1 + r, years);

            const intrinsic = pvSum + discountedTV;
            return {
                intrinsic: isFinite(intrinsic) ? intrinsic : null,
                inputs: {
                    fcf: fcf,
                    growth: g,
                    discountRate: r,
                    years,
                    terminalGrowth,
                },
            };
        };

        // Attach DCF results to each processed item
        const enriched = processedData.map((it) => {
            try {
                const { intrinsic, inputs } = computeDCF(it);
                const marketCap = toNum(it.market_cap_basic);
                const dcf_vs_market =
                    intrinsic && isFinite(marketCap) && marketCap > 0
                        ? (intrinsic / marketCap) * 100
                        : null;
                return {
                    ...it,
                    dcf_intrinsic_value: intrinsic != null ? Math.round(intrinsic) : null,
                    dcf_vs_market_cap_pct:
                        dcf_vs_market != null ? Number(dcf_vs_market.toFixed(2)) : null,
                    dcf_inputs: inputs,
                };
            } catch {
                return {
                    ...it,
                    dcf_intrinsic_value: null,
                    dcf_vs_market_cap_pct: null,
                    dcf_inputs: null,
                };
            }
        });

        return NextResponse.json(enriched, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("API 처리 오류:", error);
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

// marketConfig를 받아서 동적으로 설정
const crawling = async (marketConfig) => {
    try {
        const 분석용 = [
            "name",
            "description",
            "logoid",
            "relative_volume_10d_calc",
            "Volatility.W",
            "Volatility.M",
            "dividends_yield_current",
            "gap",
            "volume_change",
            "Perf.1Y.MarketCap",
            "Perf.W",
            "Perf.1M",
            "Perf.3M",
            "Perf.6M",
            "Perf.YTD",
            "Perf.Y",
            "Perf.5Y",
            "Perf.10Y",
            "Perf.All",
            "RSI",
            "Mom",
            "AO",
            "CCI20",
            "Stoch.K",
            "Stoch.D",
            "pricescale",
            "close",
            "change",
            "market",
        ];

        const 오버뷰 = [
            "sector.tr",
            "recommendation_mark",
            "price_target_1y_delta",
            "exchange",
        ];

        const 평가 = [
            "market_cap_basic",
            "price_earnings_ttm",
            "price_earnings_growth_ttm",
            "price_sales_current",
            "price_book_fq",
            "price_to_cash_f_operating_activities_ttm",
            "price_free_cash_flow_ttm",
            "price_to_cash_ratio",
            "enterprise_value_to_revenue_ttm",
            "enterprise_value_to_ebit_ttm",
            "enterprise_value_ebitda_ttm",
        ];

        const 배당 = [
            "continuous_dividend_payout",
            "continuous_dividend_growth",
        ];

        const 수익성 = [
            "gross_margin_ttm",
            "operating_margin_ttm",
            "pre_tax_margin_ttm",
            "free_cash_flow_margin_ttm",
            "return_on_assets_fq",
            "return_on_equity_fq",
            "return_on_invested_capital_fq",
            "sell_gen_admin_exp_other_ratio_ttm",
        ];

        const 손익계산 = [
            "total_revenue_yoy_growth_ttm",
            "earnings_per_share_diluted_yoy_growth_ttm",
        ];

        const 대차대조표 = [
            "current_ratio_fq",
            "quick_ratio_fq",
            "debt_to_equity_fq",
            "cash_n_short_term_invest_to_total_debt_fq",
        ];

        const 현금흐름 = [
            "cash_f_operating_activities_ttm",
            "cash_f_investing_activities_ttm",
            "cash_f_financing_activities_ttm",
            "free_cash_flow_ttm",
            "capital_expenditures_ttm",
        ];

        const 테크니컬즈 = [
            "Recommend.All",
            "Recommend.MA",
            "Recommend.Other",
            "BB.upper",
            "BB.basis",
            "BB.lower",
        ];

        const columns = Array.from(
            new Set([
                ...오버뷰,
                ...평가,
                ...배당,
                ...손익계산,
                ...대차대조표,
                ...현금흐름,
                ...테크니컬즈,
                ...수익성,
                ...분석용,
            ])
        );

        const response = await fetch(
            `https://scanner.tradingview.com/${marketConfig.tradingViewMarket}/scan`,
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
                    markets: [marketConfig.tradingViewMarket],
                    filter: [
                        {
                            left: "exchange",
                            operation: "in_range",
                            right: marketConfig.exchanges,
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

        const data = responseJson.data.map((item) => {
            const obj = {};
            for (let i = 0; i < columns.length; i++) {
                obj[columns[i]] = item.d[i];
            }
            return obj;
        });

        return data.map((item) => toSnakeCase(item));
    } catch (error) {
        console.error("error014", error);
        throw error;
    }
};

function toSnakeCase(obj) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        let snakeCaseKey = key
            .replace(/\\.+/g, "_") // Replace dots with underscores
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
