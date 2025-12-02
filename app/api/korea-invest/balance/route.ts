import { NextRequest, NextResponse } from "next/server";
import { getKoreaInvestConfig, getAdminClient } from "@/lib/koreaInvest";

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

export async function GET(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const EXCD = searchParams.get("EXCD") || "NASD";
        const CURRENCY = searchParams.get("CURRENCY") || "USD";
        const CTX_AREA_FK200 = searchParams.get("CTX_AREA_FK200") || "";
        const CTX_AREA_NK200 = searchParams.get("CTX_AREA_NK200") || "";
        const AUTH = searchParams.get("AUTH") || "";
        const accountIdParam = searchParams.get("accountId");

        if (!accountIdParam) {
            return NextResponse.json(
                { error: "Missing required parameter: accountId" },
                { status: 400 }
            );
        }

        const accountId = parseInt(accountIdParam);
        const config = await getKoreaInvestConfig(user.id, accountId);

        const queryParams = new URLSearchParams({
            CANO: config.cano,
            ACNT_PRDT_CD: config.acntPrdtCd,
            OVRS_EXCG_CD: EXCD,
            TR_CRCY_CD: CURRENCY,
            CTX_AREA_FK200,
            CTX_AREA_NK200,
        });

        const url = `${config.baseUrl}/uapi/overseas-stock/v1/trading/inquire-present-balance?${queryParams}`;

        const res = await fetch(url, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${AUTH}`,
                appkey: config.appKey,
                appsecret: config.appSecret,
                tr_id: "CTRP6504R",
                custtype: "P",
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json(
                { error: `KoreaInvest API Error: ${res.status}`, details: errorText },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error in balance API:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
