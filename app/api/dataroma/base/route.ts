import { NextRequest, NextResponse } from "next/server";
import { generateDataromaBase } from "../../../../dataroma_portfolio";
import dayjs from "dayjs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdmin() {
  if (!SERVICE_ROLE)
    throw new Error("Server misconfigured: missing service role key");
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

// GET /api/dataroma/base?lookup=keyword
// Returns: { based_on_person: [{ no, name, totalValue }], based_on_stock: [{ stock, person_count, sum_ratio }] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lookup = searchParams.get("lookup") || undefined;
    const forceRefresh = searchParams.get("refresh") === "1";
    const useCache = !lookup; // lookup 있을 때는 캐시 사용 안함 (부분 필터는 매번 생성)

    // 1. DB에서 캐시된 base 데이터 조회 (lookup 없고, forceRefresh 아닐 때)
    let base: unknown = null;
    if (useCache && !forceRefresh) {
      console.log(
        dayjs().format("HH:mm:ss"),
        "[DEBUG] useCache=true, forceRefresh=false, DB 조회 시작"
      );
      try {
        const admin = getAdmin();
        const { data: dbRow, error: dbError } = await admin
          .from("base")
          .select("json, updated_at")
          .eq("id", 1)
          .single();

        console.log(dayjs().format("HH:mm:ss"), "[DEBUG] DB 조회 결과:", {
          hasData: !!dbRow,
          hasJson: dbRow && "json" in dbRow,
          error: dbError,
          rowData: dbRow,
        });

        if (dbError) {
          console.error(
            dayjs().format("HH:mm:ss"),
            "[DEBUG] DB 조회 에러:",
            dbError
          );
        }

        if (dbRow && dbRow.json) {
          console.log(
            dayjs().format("HH:mm:ss"),
            "DB에서 base 데이터 조회 성공",
            `(updated_at: ${dbRow.updated_at})`
          );
          base = dbRow.json;

          // 백그라운드에서 크롤링 및 DB 업데이트 (응답 반환 후 실행)
          // 비동기 실행 후 바로 리턴
          Promise.resolve().then(async () => {
            try {
              console.log(
                dayjs().format("HH:mm:ss"),
                "[백그라운드] 크롤링 시작"
              );
              const freshBase = await generateDataromaBase({
                lookup: undefined,
              });
              console.log(
                dayjs().format("HH:mm:ss"),
                "[백그라운드] 크롤링 완료"
              );

              // DB에 upsert (기존 데이터 삭제 후 새 데이터 저장)
              const admin = getAdmin();
              console.log(
                dayjs().format("HH:mm:ss"),
                "[백그라운드] DB 업데이트 시작 (기존 데이터 삭제 후 저장)"
              );

              // 1. 기존 데이터 삭제
              await admin.from("base").delete().eq("id", 1);

              // 2. 새 데이터 삽입
              const { data: insertData, error: insertError } = await admin
                .from("base")
                .insert({
                  id: 1,
                  json: freshBase,
                  updated_at: new Date().toISOString(),
                });

              if (insertError) {
                console.error(
                  dayjs().format("HH:mm:ss"),
                  "[백그라운드] DB insert 에러:",
                  insertError
                );
              } else {
                console.log(
                  dayjs().format("HH:mm:ss"),
                  "[백그라운드] DB 업데이트 완료",
                  { insertData }
                );
              }
            } catch (bgError) {
              console.error(
                dayjs().format("HH:mm:ss"),
                "[백그라운드] 에러:",
                bgError
              );
            }
          });
        }
      } catch (dbError) {
        console.error(
          dayjs().format("HH:mm:ss"),
          "DB 조회 실패, 크롤링으로 fallback:",
          dbError
        );
      }
    }

    // 2. DB에 데이터 없거나, lookup 있거나, forceRefresh인 경우 크롤링
    if (!base) {
      console.log(
        dayjs().format("HH:mm:ss"),
        "크롤링 시작 (이유: base 없음, lookup:",
        lookup,
        ", forceRefresh:",
        forceRefresh,
        ")"
      );
      base = await generateDataromaBase({ lookup });
      console.log(dayjs().format("HH:mm:ss"), "크롤링 완료");

      // lookup 없고 useCache인 경우만 DB에 저장
      if (useCache && !lookup) {
        try {
          console.log(
            dayjs().format("HH:mm:ss"),
            "[DEBUG] 크롤링 완료 후 DB 저장 시작 (기존 데이터 삭제 후 저장)"
          );
          const admin = getAdmin();

          // 1. 기존 데이터 삭제
          await admin.from("base").delete().eq("id", 1);

          // 2. 새 데이터 삽입
          const { data: saveData, error: saveError } = await admin
            .from("base")
            .insert({
              id: 1,
              json: base,
              updated_at: new Date().toISOString(),
            });

          if (saveError) {
            console.error(
              dayjs().format("HH:mm:ss"),
              "[DEBUG] DB 저장 에러:",
              saveError
            );
          } else {
            console.log(
              dayjs().format("HH:mm:ss"),
              "DB에 base 데이터 저장 완료",
              { saveData }
            );
          }
        } catch (saveError) {
          console.error(dayjs().format("HH:mm:ss"), "DB 저장 실패:", saveError);
        }
      } else {
        console.log(
          dayjs().format("HH:mm:ss"),
          "[DEBUG] DB 저장 스킵 (useCache:",
          useCache,
          ", lookup:",
          lookup,
          ")"
        );
      }
    }

    // base is produced by dataroma_portfolio.generateDataromaBase()
    type RawPerson = {
      no?: number;
      name?: string;
      totalValue?: string | null;
      totalValueNum?: number;
      portfolio?: Array<{ code?: string; ratio?: string }>;
    };
    type RawStock = {
      stock?: string;
      person?: Array<{ no?: number; name?: string; ratio?: string }>;
      person_count?: number;
      avg_ratio?: string;
      sum_ratio?: string;
    };
    const b = base as {
      based_on_person?: RawPerson[];
      based_on_stock?: RawStock[];
      meta?: Record<string, unknown>;
    };

    console.log(dayjs().format("HH:mm:ss"), "base");

    // Normalize based_on_person: ensure totalValueNum and portfolio[] exist
    const based_on_person = (
      Array.isArray(b.based_on_person) ? b.based_on_person : []
    ).map((p: RawPerson) => ({
      no: p.no || 0,
      name: p.name || "Unknown",
      totalValue: p.totalValue || null,
      totalValueNum:
        typeof p.totalValueNum === "number"
          ? p.totalValueNum
          : p.totalValueNum || 0,
      // ensure portfolio is an array of { code, ratio }
      portfolio: Array.isArray(p.portfolio)
        ? p.portfolio.map((h) => ({
          code: h.code || "",
          ratio: h.ratio || null,
        }))
        : [],
    }));

    console.log(dayjs().format("HH:mm:ss"), "based_on_person");

    // Normalize based_on_stock: ensure each item has person[] (dataroma_portfolio already builds this)
    const based_on_stock = (
      Array.isArray(b.based_on_stock) ? b.based_on_stock : []
    ).map((s: RawStock) => ({
      stock: s.stock || "",
      person: Array.isArray(s.person)
        ? s.person.map((p) => ({
          no: p.no || 0,
          name: p.name || "Unknown",
          ratio: p.ratio || null,
        }))
        : [],
      person_count:
        typeof s.person_count === "number"
          ? s.person_count
          : s.person_count || 0,
      avg_ratio: s.avg_ratio || null,
      sum_ratio: s.sum_ratio || null,
    }));

    // If requested, enrich stocks with dcf_vs_market_cap_pct from /api/hello
    const withDetails =
      searchParams.get("withDetails") === "1" ||
      searchParams.get("withDetails") === "true";

    console.log(dayjs().format("HH:mm:ss"), "withDetails");

    let enrichedStocks = based_on_stock;
    if (withDetails && based_on_stock.length > 0) {
      try {
        const codes = Array.from(
          new Set(
            based_on_stock
              .map((s) => String(s.stock || "").toUpperCase())
              .filter(Boolean)
          )
        );

        if (codes.length > 0) {
          let helloData: unknown[] = [];

          // 1. DB에서 hello 캐시 데이터 조회 (id=2)
          try {
            const admin = getAdmin();
            const { data: helloRow, error: helloError } = await admin
              .from("base")
              .select("json, updated_at")
              .eq("id", 2)
              .single();

            console.log(
              dayjs().format("HH:mm:ss"),
              "[DEBUG] Hello DB 조회 결과:",
              {
                hasData: !!helloRow,
                hasJson: helloRow && "json" in helloRow,
                error: helloError,
              }
            );

            if (helloRow && helloRow.json) {
              console.log(
                dayjs().format("HH:mm:ss"),
                "DB에서 hello 데이터 조회 성공",
                `(updated_at: ${helloRow.updated_at})`
              );
              helloData = Array.isArray(helloRow.json) ? helloRow.json : [];

              // 백그라운드에서 hello API 조회 및 DB 업데이트
              Promise.resolve().then(async () => {
                try {
                  console.log(
                    dayjs().format("HH:mm:ss"),
                    "[백그라운드] Hello API 조회 시작"
                  );
                  const q = codes.join(",");
                  const host = req.headers.get("host") || "";
                  const proto = req.headers.get("x-forwarded-proto") || "http";
                  const res = await fetch(
                    `${proto}://${host}/api/hello?codes=${encodeURIComponent(
                      q
                    )}`
                  );

                  if (res.ok) {
                    const freshHelloData = await res.json();
                    console.log(
                      dayjs().format("HH:mm:ss"),
                      "[백그라운드] Hello API 조회 완료"
                    );

                    // DB 업데이트 (id=2)
                    const admin = getAdmin();
                    await admin.from("base").delete().eq("id", 2);
                    const { error: insertError } = await admin
                      .from("base")
                      .insert({
                        id: 2,
                        json: freshHelloData,
                        updated_at: new Date().toISOString(),
                      });

                    if (insertError) {
                      console.error(
                        dayjs().format("HH:mm:ss"),
                        "[백그라운드] Hello DB 저장 에러:",
                        insertError
                      );
                    } else {
                      console.log(
                        dayjs().format("HH:mm:ss"),
                        "[백그라운드] Hello DB 업데이트 완료"
                      );
                    }
                  }
                } catch (bgError) {
                  console.error(
                    dayjs().format("HH:mm:ss"),
                    "[백그라운드] Hello API 에러:",
                    bgError
                  );
                }
              });
            } else {
              // DB에 데이터 없으면 즉시 조회
              console.log(
                dayjs().format("HH:mm:ss"),
                "Hello DB 데이터 없음, 즉시 조회 시작"
              );
              const q = codes.join(",");
              const host = req.headers.get("host") || "";
              const proto = req.headers.get("x-forwarded-proto") || "http";
              const res = await fetch(
                `${proto}://${host}/api/hello?codes=${encodeURIComponent(q)}`
              );

              if (res.ok) {
                helloData = await res.json();
                console.log(dayjs().format("HH:mm:ss"), "Hello API 조회 완료");

                // DB 저장
                const admin = getAdmin();
                await admin.from("base").delete().eq("id", 2);
                await admin.from("base").insert({
                  id: 2,
                  json: helloData,
                  updated_at: new Date().toISOString(),
                });
                console.log(dayjs().format("HH:mm:ss"), "Hello DB 저장 완료");
              }
            }
          } catch (dbError) {
            console.error(
              dayjs().format("HH:mm:ss"),
              "Hello DB 조회 실패, API로 fallback:",
              dbError
            );

            // Fallback: API 직접 조회
            const q = codes.join(",");
            const host = req.headers.get("host") || "";
            const proto = req.headers.get("x-forwarded-proto") || "http";
            const res = await fetch(
              `${proto}://${host}/api/hello?codes=${encodeURIComponent(q)}`
            );
            if (res.ok) {
              helloData = await res.json();
            }
          }

          // 2. Hello 데이터로 enrichment 수행
          if (Array.isArray(helloData) && helloData.length > 0) {
            console.log(
              dayjs().format("HH:mm:ss"),
              "Hello 데이터로 enrichment 시작"
            );
            const map = new Map(
              helloData.map((it: unknown) => {
                const obj = it as Record<string, unknown>;
                const key = String(obj.name || obj.symbol || "").toUpperCase();
                return [key, obj] as [string, Record<string, unknown>];
              })
            );
            enrichedStocks = based_on_stock.map((s) => {
              const key = String(s.stock || "").toUpperCase();
              const item = map.get(key) as Record<string, unknown> | undefined;
              let dcf: number | null = null;
              let logoid: string | undefined = undefined;
              let market: string | undefined = undefined;
              let exchange: string | undefined = undefined;
              let bbLower: number | undefined = undefined;
              let bbMiddle: number | undefined = undefined;
              let bbUpper: number | undefined = undefined;
              let close: number | undefined = undefined;
              let ai: number | undefined = undefined;
              let sma20: number | undefined = undefined;
              let sma50: number | undefined = undefined;
              let sma100: number | undefined = undefined;
              let sma200: number | undefined = undefined;
              let rsi: number | undefined = undefined;
              if (item) {
                const raw = item["dcf_vs_market_cap_pct"];
                logoid =
                  typeof item["logoid"] === "string"
                    ? item["logoid"]
                    : undefined;
                market =
                  typeof item["market"] === "string"
                    ? item["market"]
                    : undefined;
                exchange =
                  typeof item["exchange"] === "string"
                    ? item["exchange"]
                    : undefined;
                bbLower =
                  typeof item["b_b_lower"] === "number"
                    ? item["b_b_lower"]
                    : undefined;
                bbMiddle =
                  typeof item["b_b_basis"] === "number"
                    ? item["b_b_basis"]
                    : undefined;
                bbUpper =
                  typeof item["b_b_upper"] === "number"
                    ? item["b_b_upper"]
                    : undefined;
                sma20 =
                  typeof item["s_m_a20"] === "number" ? item["s_m_a20"] : undefined;
                sma50 =
                  typeof item["s_m_a50"] === "number" ? item["s_m_a50"] : undefined;
                sma100 =
                  typeof item["s_m_a100"] === "number"
                    ? item["s_m_a100"]
                    : undefined;
                sma200 =
                  typeof item["s_m_a200"] === "number"
                    ? item["s_m_a200"]
                    : undefined;
                rsi =
                  typeof item["r_s_i"] === "number" ? item["r_s_i"] : undefined;
                close =
                  typeof item["close"] === "number" ? item["close"] : undefined;
                ai =
                  typeof item["예측결과"] === "number"
                    ? item["예측결과"]
                    : undefined;

                if (typeof raw === "number") dcf = raw;
                else if (typeof raw === "string") {
                  const n = Number(raw);
                  if (!Number.isNaN(n)) dcf = n;
                }
              }
              return {
                ...s,
                dcf_vs_market_cap_pct: dcf,
                logoid,
                market,
                exchange,
                bbLower,
                bbMiddle,
                bbUpper,
                close,
                ai,
                sma20,
                sma50,
                sma100,
                sma200,
                rsi,
              };
            });
          }
        }
      } catch (enrichError) {
        console.error(
          dayjs().format("HH:mm:ss"),
          "Enrichment 에러:",
          enrichError
        );
        // ignore enrichment errors and fall back to base
      }
    }

    const payload = {
      based_on_person,
      based_on_stock: enrichedStocks,
      meta: b.meta || {},
    };
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Cache": base ? "DB-HIT" : "MISS",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
