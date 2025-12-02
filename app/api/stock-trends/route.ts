import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/koreaInvest";

async function getUser(req: NextRequest) {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const admin = getAdminClient();
    const {
        data: { user },
    } = await admin.auth.getUser(token);
    return user ?? null;
}

// 추세 데이터 조회
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get("symbol");

        const admin = getAdminClient();

        if (symbol) {
            // 특정 종목 조회
            const { data, error } = await admin
                .from("stock_trends")
                .select("*")
                .eq("symbol", symbol)
                .single();

            if (error && error.code !== "PGRST116") {
                throw error;
            }

            return NextResponse.json({ data });
        } else {
            // 전체 종목 조회
            const { data, error } = await admin
                .from("stock_trends")
                .select("*")
                .order("updated_at", { ascending: false });

            if (error) throw error;

            return NextResponse.json({ data });
        }
    } catch (error: unknown) {
        console.error("Error fetching stock trends:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// 추세 데이터 저장/업데이트
export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            symbol,
            ma20, ma50, ma100, ma200,
            ma20_slope, ma50_slope, ma100_slope, ma200_slope
        } = body;

        if (!symbol || !ma20 || !ma50 || !ma100 || !ma200) {
            return NextResponse.json(
                { error: "Missing required fields: symbol, ma20, ma50, ma100, ma200" },
                { status: 400 }
            );
        }

        const admin = getAdminClient();
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await admin
            .from("stock_trends")
            .upsert(
                {
                    symbol,
                    ma20,
                    ma50,
                    ma100,
                    ma200,
                    ma20_slope: ma20_slope || 0,
                    ma50_slope: ma50_slope || 0,
                    ma100_slope: ma100_slope || 0,
                    ma200_slope: ma200_slope || 0,
                    updated_at: today,
                },
                {
                    onConflict: "symbol",
                }
            )
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ 추세 저장 완료: ${symbol}`, data);
        return NextResponse.json({ data });
    } catch (error: unknown) {
        console.error("Error saving stock trend:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
