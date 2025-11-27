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

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { accountId, orderType, EXCD, SYMB, QTY, PRICE, ORD_DVSN, AUTH } = body;

        if (!accountId) {
            return NextResponse.json(
                { error: "Missing required parameter: accountId" },
                { status: 400 }
            );
        }

        if (!orderType || !EXCD || !SYMB || !QTY || PRICE === undefined || !ORD_DVSN) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const config = await getKoreaInvestConfig(user.id, accountId);

        const trId = orderType === "BUY" ? "TTTT1002U" : "TTTT1006U";

        const url = `${config.baseUrl}/uapi/overseas-stock/v1/trading/order`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${AUTH || ""}`,
                appkey: config.appKey,
                appsecret: config.appSecret,
                tr_id: trId,
                custtype: "P",
            },
            body: JSON.stringify({
                CANO: config.cano,
                ACNT_PRDT_CD: config.acntPrdtCd,
                OVRS_EXCG_CD: EXCD,
                PDNO: SYMB,
                ORD_QTY: QTY,
                OVRS_ORD_UNPR: PRICE,
                ORD_SVR_DVSN_CD: "0",
                ORD_DVSN: ORD_DVSN,
            }),
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
    } catch (error: any) {
        console.error("Error in order API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
