import { NextRequest, NextResponse } from "next/server";
import { generateDataromaBase } from "../../../../dataroma_portfolio";

// In-memory cache (per server process). Resets on redeploy / cold start.
interface CacheEntry<T> {
  data: T;
  ts: number;
}
const CACHE_TTL_MS = 1000 * 60 * 30; // 30분
let cachedBase: CacheEntry<unknown> | null = null;

// GET /api/dataroma/base?lookup=keyword
// Returns: { based_on_person: [{ no, name, totalValue }], based_on_stock: [{ stock, person_count, sum_ratio }] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lookup = searchParams.get("lookup") || undefined;
    const forceRefresh = searchParams.get("refresh") === "1";
    const useCache = !lookup; // lookup 있을 때는 캐시 사용 안함 (부분 필터는 매번 생성)

    if (useCache && !forceRefresh && cachedBase) {
      const age = Date.now() - cachedBase.ts;
      if (age < CACHE_TTL_MS) {
        return NextResponse.json(cachedBase.data, {
          status: 200,
          headers: { "Cache-Control": "no-store", "X-Cache": "HIT" },
        });
      }
    }

    const base = await generateDataromaBase({ lookup });

    console.log("base", base);

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

    console.log("b", b);

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

    console.log("based_on_person", based_on_person);

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
    console.log("withDetails", withDetails);

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

            console.log("arr.length", arr.length);
            console.log("arr[0]", arr[0]);
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
                if (item) {
                  const raw = item["dcf_vs_market_cap_pct"];
                  if (typeof raw === "number") dcf = raw;
                  else if (typeof raw === "string") {
                    const n = Number(raw);
                    if (!Number.isNaN(n)) dcf = n;
                  }
                }
                return {
                  ...s,
                  dcf_vs_market_cap_pct: dcf,
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
    if (useCache) cachedBase = { data: payload, ts: Date.now() };
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
