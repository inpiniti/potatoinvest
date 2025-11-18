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
    const { accountId, kiAccessToken, exchange, stock, qty, unpr, orderType } =
      body;

    // 필수 파라미터 검증
    if (
      !accountId ||
      !kiAccessToken ||
      !exchange ||
      !stock ||
      !qty ||
      !unpr ||
      !orderType
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // orderType 검증 (buy 또는 sell)
    if (orderType !== "buy" && orderType !== "sell") {
      return NextResponse.json(
        { error: "Invalid orderType. Must be 'buy' or 'sell'" },
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

    // 거래소 코드 매핑
    const EXCHANGE_MAP: Record<string, string> = {
      NASDAQ: "NASD",
      NYSE: "NYSE",
      AMEX: "AMEX",
    };
    const OVRS_EXCG_CD = EXCHANGE_MAP[exchange] || exchange;

    // TR ID 설정: 매수/매도에 따라 다름
    // TTTT1002U: 해외주식 매수 주문
    // TTTT1006U: 해외주식 매도 주문
    const tr_id = orderType === "buy" ? "TTTT1002U" : "TTTT1006U";

    // 실전투자 도메인
    const url =
      "https://openapi.koreainvestment.com:9443/uapi/overseas-stock/v1/trading/order";

    // 주문 요청 바디
    const orderBody = {
      CANO, // 계좌번호 앞 8자리
      ACNT_PRDT_CD, // 계좌상품코드 뒤 2자리
      OVRS_EXCG_CD, // 해외거래소코드 (NASD, NYSE, AMEX 등)
      PDNO: stock, // 상품번호 (종목코드)
      ORD_QTY: String(qty), // 주문수량
      OVRS_ORD_UNPR: String(unpr), // 해외주문단가
      ORD_SVR_DVSN_CD: "0", // 주문서버구분코드 (0: 해외)
      ORD_DVSN: "00", // 주문구분 (00: 지정가, 01: 시장가)
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${kiAccessToken}`,
        appkey: account.api_key,
        appsecret: secret,
        tr_id,
      },
      body: JSON.stringify(orderBody),
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
