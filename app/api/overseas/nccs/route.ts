import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decryptSecret } from "@/lib/secretCrypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdmin() {
  if (!SERVICE_ROLE)
    throw new Error("Server misconfigured: missing service role key");
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

async function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const admin = getAdmin();
  const {
    data: { user },
  } = await admin.auth.getUser(token);
  return user ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { accountId, kiAccessToken } = body;

    if (!accountId || !kiAccessToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    const { data: account, error } = await admin
      .from("brokerage_accounts")
      .select("id, account_no, api_key, secret_key_enc")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (error || !account)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!account.secret_key_enc)
      return NextResponse.json(
        { error: "Secret not stored encrypted" },
        { status: 500 }
      );

    let secret: string;
    try {
      secret = decryptSecret(account.secret_key_enc);
    } catch {
      return NextResponse.json({ error: "Decrypt failed" }, { status: 500 });
    }

    // 계좌번호 포맷팅: 8자리-2자리로 분할
    const accountNumber = account.account_no.replace(/[^0-9]/g, "");
    const CANO = accountNumber.slice(0, 8);
    const ACNT_PRDT_CD = accountNumber.slice(8, 10);

    const url =
      "https://openapivts.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/inquire-nccs";

    // 쿼리 파라미터 설정 (NASD 고정, 나머지 공란)
    const params = new URLSearchParams({
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD", // 미국 전체
      SORT_SQN: "", // 정렬순서 (공란)
      CTX_AREA_FK200: "", // 연속조회검색조건200 (공란)
      CTX_AREA_NK200: "", // 연속조회키200 (공란)
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${kiAccessToken}`,
        appkey: account.api_key,
        appsecret: secret,
        tr_id: "TTTS3018R", // 해외주식 미체결내역
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
