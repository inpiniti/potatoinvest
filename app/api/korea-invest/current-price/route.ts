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
        const EXCD = searchParams.get("EXCD");
        const SYMB = searchParams.get("SYMB");
        const AUTH = searchParams.get("AUTH") || "";
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
        const config = await getKoreaInvestConfig(user.id, accountId);

        const queryParams = new URLSearchParams({
            AUTH,
            EXCD,
            SYMB,
        });

        const url = `${config.baseUrl}/uapi/overseas-price/v1/quotations/price-detail?${queryParams}`;

        const res = await fetch(url, {
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${AUTH}`,
                appkey: config.appKey,
                appsecret: config.appSecret,
                tr_id: "HHDFS76950100",
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
    } catch (error: any) {
        console.error("Error in current-price API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
