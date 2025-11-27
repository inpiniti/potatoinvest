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
        } catch (e) {
            // JSON 파싱 에러 무시 (Body가 없거나 형식이 잘못되어도 기본 계좌로 진행)
            console.warn("Body parsing failed or empty, using default account.");
        }

        // 3. 한투 설정 가져오기 (내부적으로 토큰 발급 수행)
        const config = await getKoreaInvestConfig(user.id, accountId);

        // 4. 토큰 반환
        return NextResponse.json({
            access_token: config.accessToken,
            token_type: "Bearer",
            expires_in: 86400, // 유효기간 (실제로는 한투 응답에서 가져와야 정확하지만, 여기선 24시간 가정)
            account_no: config.accountNo, // 편의를 위해 계좌번호도 함께 반환
        });
    } catch (error: any) {
        console.error("Error in token API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
