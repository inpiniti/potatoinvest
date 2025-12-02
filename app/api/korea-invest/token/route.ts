import { NextRequest, NextResponse } from "next/server";
import { getKoreaInvestConfig, getAdminClient, fetchAccessToken } from "@/lib/koreaInvest";

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
        // 1. 사용자 인증
        const user = await getUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Body 파싱 (accountId 선택적 수신)
        let accountId: string | undefined;
        try {
            const text = await req.text(); // text로 먼저 읽어서 비어있는지 확인
            if (text) {
                const body = JSON.parse(text);
                accountId = body.accountId;
            }
        } catch {
            // JSON 파싱 에러 무시 (Body가 없거나 형식이 잘못되어도 기본 계좌로 진행)
            console.warn("Body parsing failed or empty, using default account.");
        }

        // 3. 계좌 ID 결정
        let targetAccountId: number | undefined = accountId ? parseInt(accountId) : undefined;

        if (!targetAccountId || isNaN(targetAccountId)) {
            const admin = getAdminClient();
            const { data: accounts } = await admin
                .from("brokerage_accounts")
                .select("id")
                .eq("user_id", user.id)
                .limit(1);

            if (accounts && accounts.length > 0) {
                targetAccountId = accounts[0].id;
            } else {
                return NextResponse.json({ error: "No brokerage account found" }, { status: 404 });
            }
        }

        // 4. 한투 설정 가져오기
        if (targetAccountId === undefined) {
            return NextResponse.json({ error: "No brokerage account found" }, { status: 404 });
        }
        const config = await getKoreaInvestConfig(user.id, targetAccountId);

        // 5. 토큰 발급
        const accessToken = await fetchAccessToken(config.appKey, config.appSecret);

        // 6. 토큰 반환
        return NextResponse.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 86400, // 유효기간 (실제로는 한투 응답에서 가져와야 정확하지만, 여기선 24시간 가정)
            account_no: config.accountNo, // 편의를 위해 계좌번호도 함께 반환
        });
    } catch (error: unknown) {
        console.error("Error in token API:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
