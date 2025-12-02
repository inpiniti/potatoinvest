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
        const START_DATE = searchParams.get("START_DATE");
        const END_DATE = searchParams.get("END_DATE");
        const EXCD = searchParams.get("EXCD") || "NASD";
        const NATN_CD = searchParams.get("NATN_CD") || "840";
        const CURRENCY = searchParams.get("CURRENCY") || "USD";
        const CURRENCY_TYPE = searchParams.get("CURRENCY_TYPE") || "02";
        const CTX_AREA_FK200 = searchParams.get("CTX_AREA_FK200") || "";
        const CTX_AREA_NK200 = searchParams.get("CTX_AREA_NK200") || "";
        const accountIdParam = searchParams.get("accountId");

        if (!START_DATE || !END_DATE) {
            return NextResponse.json(
                { error: "Missing required parameters: START_DATE, END_DATE" },
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
        const config = await getKoreaInvestConfig(user.id, accountId);

        const koreaInvestToken = req.headers.get("x-korea-invest-token");
        if (!koreaInvestToken) {
            return NextResponse.json(
                { error: "Missing KoreaInvest Access Token (x-korea-invest-token header)" },
                { status: 400 }
            );
        }

        const queryParams = new URLSearchParams({
            CANO: config.cano,
            ACNT_PRDT_CD: config.acntPrdtCd,
            OVRS_EXCG_CD: EXCD,
            NATN_CD,
            TR_CRCY_CD: CURRENCY,
            WCRC_FRCR_DVSN_CD: CURRENCY_TYPE,
            INQR_STRT_DT: START_DATE,
            INQR_END_DT: END_DATE,
            CTX_AREA_FK200,
            CTX_AREA_NK200,
        });

        const url = `${config.baseUrl}/uapi/overseas-stock/v1/trading/inquire-period-profit?${queryParams}`;

        const res = await fetch(url, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${koreaInvestToken}`,
                appkey: config.appKey,
                appsecret: config.appSecret,
                tr_id: "TTTS3039R",
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
        console.error("Error in profit API:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
