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

type ExchangeCode = "NASD" | "NYSE" | "AMEX";

function toOvrsExchange(code: string): ExchangeCode | null {
  const up = String(code).toUpperCase();
  if (up === "NASD" || up === "NYSE" || up === "AMEX")
    return up as ExchangeCode;
  if (up === "NAS") return "NASD";
  if (up === "NYS") return "NYSE";
  return null;
}

interface OrderBody {
  accountId: number;
  kiAccessToken: string; // KI OAuth access token
  side: "BUY" | "SELL"; // 매수/매도
  OVRS_EXCG_CD: ExchangeCode; // NASD | NYSE
  PDNO: string; // 종목코드 (심볼)
  ORD_QTY: number; // 주문수량
  OVRS_ORD_UNPR: number; // 해외주문단가
  ORD_DVSN?: string; // 기본 00 (지정가)
  SLL_TYPE?: string; // 매도시 00
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: OrderBody = await req.json();
    const {
      accountId,
      kiAccessToken,
      side,
      OVRS_EXCG_CD,
      PDNO,
      ORD_QTY,
      OVRS_ORD_UNPR,
      ORD_DVSN = "00",
      SLL_TYPE,
    } = body || ({} as OrderBody);

    if (
      !accountId ||
      !kiAccessToken ||
      !side ||
      !OVRS_EXCG_CD ||
      !PDNO ||
      !ORD_QTY ||
      !OVRS_ORD_UNPR
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize exchange code: accept NAS/NYS and map to NASD/NYSE
    const mappedExcd = toOvrsExchange(OVRS_EXCG_CD);
    if (!mappedExcd) {
      return NextResponse.json(
        { error: "Invalid exchange code", detail: { OVRS_EXCG_CD } },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    const { data: account, error } = await admin
      .from("brokerage_accounts")
      .select("id, user_id, account_no, api_key, secret_key_enc")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();
    if (error || !account)
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (!account.secret_key_enc)
      return NextResponse.json(
        { error: "Secret not encrypted" },
        { status: 500 }
      );

    let apiSecret: string;
    try {
      apiSecret = decryptSecret(account.secret_key_enc);
    } catch {
      return NextResponse.json({ error: "Decrypt failed" }, { status: 500 });
    }

    // Split account number to CANO / ACNT_PRDT_CD
    const digits = String(account.account_no || "").replace(/[^0-9]/g, "");
    const CANO = digits.slice(0, 8);
    const ACNT_PRDT_CD = digits.slice(8, 10);

    // Normalize PDNO for KIS (e.g., BRK.B -> BRK/B)
    const PDNO_KIS = String(PDNO).toUpperCase().replace(/[.,]/g, "/");

    // Endpoint and TR IDs for real trading
    const port = "9443";
    const domain = "openapi";
    const endpoint = "uapi/overseas-stock/v1/trading/order";
    const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;
    const trId = side === "BUY" ? "TTTT1002U" : "TTTT1006U"; // 실전 매수/매도

    const headers = {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${kiAccessToken}`,
      appkey: (account as typeof account & { api_key: string }).api_key,
      appsecret: apiSecret,
      tr_id: trId,
    } as const;

    const payload: Record<string, string> = {
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: mappedExcd,
      PDNO: PDNO_KIS,
      ORD_QTY: String(ORD_QTY),
      OVRS_ORD_UNPR: String(OVRS_ORD_UNPR),
      ORD_SVR_DVSN_CD: "0",
      ORD_DVSN,
    };
    if (side === "SELL") {
      // 매도시 판매유형 00 필요
      payload.SLL_TYPE = SLL_TYPE || "00";
    }

    const kiRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const json = await kiRes.json();
    if (!kiRes.ok) {
      return NextResponse.json(
        { error: "KI order failed", detail: json },
        { status: 502 }
      );
    }
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
