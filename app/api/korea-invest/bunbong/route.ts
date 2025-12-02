import { NextRequest, NextResponse } from "next/server";
import { getKoreaInvestConfig, getAdminClient } from "@/lib/koreaInvest";

async function getUser(req: NextRequest) {
    const auth = req.headers.get("authorization");
    console.log("🔐 [getUser] Authorization header:", auth ? `Bearer ${auth.slice(7, 20)}...` : "MISSING");

    if (!auth?.startsWith("Bearer ")) {
        console.log("❌ [getUser] No Bearer token found");
        return null;
    }

    const token = auth.slice(7);
    console.log("🔐 [getUser] Token length:", token.length);

    const admin = getAdminClient();

    try {
        const {
            data: { user },
        } = await admin.auth.getUser(token);

        if (user) {
            console.log("✅ [getUser] User authenticated:", user.id);
        } else {
            console.log("❌ [getUser] No user found for token");
        }

        return user ?? null;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ [getUser] Supabase auth error:", errorMessage);
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            console.log("❌ [bunbong] Returning 401 Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const EXCD = searchParams.get("EXCD");
        const SYMB = searchParams.get("SYMB");
        const NMIN = searchParams.get("NMIN") || "1";
        const PINC = searchParams.get("PINC") || "0";
        const NEXT = searchParams.get("NEXT") || "";
        const NREC = searchParams.get("NREC") || "120";
        const KEYB = searchParams.get("KEYB") || "";
        const accountIdParam = searchParams.get("accountId");

        if (!EXCD || !SYMB) {
            return NextResponse.json(
                { error: "Missing required parameters: EXCD, SYMB" },
                { status: 400 }
            );
        }

        if (!accountIdParam) {
            return NextResponse.json(
                { error: "Missing required parameter: accountId" },
                { status: 400 }
            );
        }

        const accountId = parseInt(accountIdParam);
        console.log("🔍 [bunbong] Getting config for user:", user.id, "account:", accountId);

        const config = await getKoreaInvestConfig(user.id, accountId);

        const koreaInvestToken = req.headers.get("x-korea-invest-token");
        if (!koreaInvestToken) {
            return NextResponse.json(
                { error: "Missing KoreaInvest Access Token (x-korea-invest-token header)" },
                { status: 400 }
            );
        }

        const queryParams = new URLSearchParams({
            EXCD,
            SYMB,
            NMIN,
            PINC,
            NEXT,
            NREC,
            KEYB,
        });

        const url = `${config.baseUrl}/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice?${queryParams}`;
        console.log("🔍 [bunbong] Calling KoreaInvest API:", url);

        const res = await fetch(url, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${koreaInvestToken}`,
                appkey: config.appKey,
                appsecret: config.appSecret,
                tr_id: "HHDFS76950200",
                custtype: "P",
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ [bunbong] KoreaInvest API error:", res.status, errorText);
            return NextResponse.json(
                { error: `KoreaInvest API Error: ${res.status}`, details: errorText },
                { status: res.status }
            );
        }

        const data = await res.json();
        console.log("✅ [bunbong] Success");
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("❌ [bunbong] Error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
