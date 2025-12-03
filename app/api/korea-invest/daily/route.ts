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
        const GUBN = searchParams.get("GUBN") || "0";
        const MODP = searchParams.get("MODP") || "1";
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

        const koreaInvestToken = req.headers.get("x-korea-invest-token");

        if (!koreaInvestToken) {
            return NextResponse.json(
                { error: "Missing KoreaInvest Access Token (x-korea-invest-token header)" },
                { status: 400 }
            );
        }

        // BYMD 방식으로 페이징 (날짜 기준으로 과거로 이동)
        const allData: unknown[] = [];
        let currentDate = ""; // 빈 문자열 = 최신 데이터부터
        const targetCount = 450;
        const maxIterations = 5;

        for (let i = 0; i < maxIterations; i++) {
            const queryParams = new URLSearchParams({
                EXCD,
                SYMB,
                GUBN,
                BYMD: currentDate, // 조회 시작 날짜
                MODP,
            });

            const url = `${config.baseUrl}/uapi/overseas-price/v1/quotations/dailyprice?${queryParams}`;

            const res = await fetch(url, {
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${koreaInvestToken}`,
                    appkey: config.appKey,
                    appsecret: config.appSecret,
                    tr_id: "HHDFS76240000",
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

            if (data.output2 && Array.isArray(data.output2)) {
                const firstItem = data.output2[0];
                const lastItem = data.output2[data.output2.length - 1];

                console.log(`[Daily API] Loop ${i + 1}: fetched ${data.output2.length}, dates: ${firstItem?.xymd} ~ ${lastItem?.xymd}, total ${allData.length + data.output2.length}`);

                allData.push(...data.output2);

                // 다음 조회는 마지막 날짜 다음날부터 (과거로 이동)
                if (lastItem && lastItem.xymd) {
                    // xymd에서 하루 빼기 (YYYYMMDD 형식)
                    const lastDate = new Date(
                        parseInt(lastItem.xymd.substring(0, 4)),
                        parseInt(lastItem.xymd.substring(4, 6)) - 1,
                        parseInt(lastItem.xymd.substring(6, 8))
                    );
                    lastDate.setDate(lastDate.getDate() - 1);

                    const year = lastDate.getFullYear();
                    const month = String(lastDate.getMonth() + 1).padStart(2, '0');
                    const day = String(lastDate.getDate()).padStart(2, '0');
                    currentDate = `${year}${month}${day}`;

                    console.log(`[Daily API] Next BYMD: ${currentDate}`);
                }
            }

            if (allData.length >= targetCount) {
                console.log(`[Daily API] Target reached: ${allData.length}`);
                break;
            }

            if (!data.output2 || data.output2.length < 100) {
                console.log(`[Daily API] Last page: ${allData.length}`);
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const response = {
            rt_cd: "0",
            msg_cd: "MCA00000",
            msg1: "정상처리 되었습니다.",
            output1: {
                rsym: `${EXCD}@${SYMB}`,
                zdiv: "1",
                gubn: GUBN,
            },
            output2: allData,
        };

        console.log(`[Daily API] Final response: ${allData.length} records`);
        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error("Error in daily API:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
