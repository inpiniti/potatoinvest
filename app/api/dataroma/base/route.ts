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
      try {
        const admin = getAdmin();
        const { data: dbRow } = await admin
          .from("base")
          .select("data, updated_at")
          .eq("id", 1)
          .single();

        if (dbRow && dbRow.data) {
          console.log(
            dayjs().format("HH:mm:ss"),
            "DB에서 base 데이터 조회 성공"
          );
          base = dbRow.data;

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

              // DB에 upsert
              const admin = getAdmin();
              await admin
                .from("base")
                .upsert(
                  {
                    id: 1,
                    data: freshBase,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "id" }
                );
              console.log(
                dayjs().format("HH:mm:ss"),
                "[백그라운드] DB 업데이트 완료"
              );
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
      console.log(dayjs().format("HH:mm:ss"), "크롤링 시작");
      base = await generateDataromaBase({ lookup });
      console.log(dayjs().format("HH:mm:ss"), "크롤링 완료");

      // lookup 없고 useCache인 경우만 DB에 저장
      if (useCache && !lookup) {
        try {
          const admin = getAdmin();
          await admin
            .from("base")
            .upsert(
              { id: 1, data: base, updated_at: new Date().toISOString() },
              { onConflict: "id" }
            );
          console.log(dayjs().format("HH:mm:ss"), "DB에 base 데이터 저장 완료");
        } catch (saveError) {
          console.error(dayjs().format("HH:mm:ss"), "DB 저장 실패:", saveError);
        }
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
          const q = codes.join(",");
          const host = req.headers.get("host") || "";
          const proto = req.headers.get("x-forwarded-proto") || "http";
          const res = await fetch(
            `${proto}://${host}/api/hello?codes=${encodeURIComponent(q)}`
          );
          if (res.ok) {
            const arr = await res.json();

            console.log(dayjs().format("HH:mm:ss"), "/api/hello");
            if (Array.isArray(arr)) {
              const map = new Map(
                arr.map((it: unknown) => {
                  const obj = it as Record<string, unknown>;
                  const key = String(
                    obj.name || obj.symbol || ""
                  ).toUpperCase();
                  return [key, obj] as [string, Record<string, unknown>];
                })
              );
              enrichedStocks = based_on_stock.map((s) => {
                const key = String(s.stock || "").toUpperCase();
                const item = map.get(key) as
                  | Record<string, unknown>
                  | undefined;
                let dcf: number | null = null;
                let logoid: string | undefined = undefined;
                let market: string | undefined = undefined;
                let exchange: string | undefined = undefined;
                let bbLower: number | undefined = undefined;
                let bbMiddle: number | undefined = undefined;
                let bbUpper: number | undefined = undefined;
                let close: number | undefined = undefined;
                let ai: number | undefined = undefined;
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
                  close =
                    typeof item["close"] === "number"
                      ? item["close"]
                      : undefined;
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
                };
              });
            }
          }
        }
      } catch {
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
