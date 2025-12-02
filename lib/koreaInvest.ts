import { createClient } from "@supabase/supabase-js";
import { decryptSecret } from "./secretCrypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KOREA_INVEST_URL = "https://openapi.koreainvestment.com:9443";

// Admin 클라이언트 (RLS 우회하여 계좌 정보 조회용)
export function getAdminClient() {
    if (!SERVICE_ROLE)
        throw new Error("Server misconfigured: missing service role key");
    return createClient(SUPABASE_URL, SERVICE_ROLE, {
        auth: { persistSession: false },
    });
}

// 한투 API 호출을 위한 기본 정보 조회 (토큰 제외)
// 조회 API는 클라이언트가 전달한 AUTH 토큰을 그대로 사용
export async function getKoreaInvestConfig(userId: string, accountId: number) {
    const admin = getAdminClient();

    const { data: accounts, error } = await admin
        .from("brokerage_accounts")
        .select("id, user_id, account_no, api_key, secret_key_enc, alias")
        .eq("user_id", userId)
        .eq("id", accountId);

    console.log("🔍 [getKoreaInvestConfig] userId:", userId);
    console.log("🔍 [getKoreaInvestConfig] accountId:", accountId);

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    if (!accounts || accounts.length === 0) {
        throw new Error(`Account with id ${accountId} not found for user ${userId}`);
    }

    const account = accounts[0];

    console.log("🔍 [getKoreaInvestConfig] selected account:", {
        id: account.id,
        account_no: account.account_no,
        alias: account.alias,
    });

    if (!account.api_key || !account.secret_key_enc) {
        throw new Error("API key or Secret key is missing in the account");
    }

    const appKey = account.api_key;
    const appSecret = decryptSecret(account.secret_key_enc);

    // 계좌번호 파싱
    const cleanAccountNo = account.account_no.replace(/-/g, "");
    const cano = cleanAccountNo.substring(0, 8);
    const acntPrdtCd = cleanAccountNo.length > 8 ? cleanAccountNo.substring(8, 10) : "01";

    return {
        baseUrl: KOREA_INVEST_URL,
        appKey,
        appSecret,
        accountNo: cleanAccountNo,
        cano,
        acntPrdtCd,
    };
}

// 토큰 발급 함수 (token API에서만 사용)
export async function fetchAccessToken(appKey: string, appSecret: string) {
    console.log("🔑 [fetchAccessToken] Requesting token from KoreaInvest...");
    console.log("🔑 [fetchAccessToken] appKey:", appKey.slice(0, 10) + "...");
    console.log("🔑 [fetchAccessToken] appSecret length:", appSecret.length);

    const res = await fetch(`${KOREA_INVEST_URL}/oauth2/tokenP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "client_credentials",
            appkey: appKey,
            appsecret: appSecret,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ [fetchAccessToken] Token fetch failed:", res.status);
        console.error("❌ [fetchAccessToken] Error response:", errorText);
        console.error("❌ [fetchAccessToken] This means your KoreaInvest API Key or Secret is invalid/expired");
        throw new Error(`Failed to get access token: ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ [fetchAccessToken] Token obtained successfully");
    return data.access_token;
}
