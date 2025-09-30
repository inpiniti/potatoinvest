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

interface Body {
  accountId: number;
  kiAccessToken: string;
  exchange?: "NASD" | "NYSE" | "AMEX"; // optional filter; default NASD
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body: Body = await req.json();
    const { accountId, kiAccessToken, exchange = "NASD" } = body || {};
    if (!accountId || !kiAccessToken) {
      return NextResponse.json(
        { error: "Missing accountId or kiAccessToken" },
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

    const port = "9443";
    const domain = "openapi";
    const endpoint = "uapi/overseas-stock/v1/trading/inquire-nccs";
    const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;
    const trId = "TTTS3018R";

    // Split account number
    const digits = (account.account_no || "").replace(/[^0-9]/g, "");
    const CANO = digits.slice(0, 8);
    const ACNT_PRDT_CD = digits.slice(8, 10);

    const qs = new URLSearchParams({
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: exchange,
      SORT_SQN: "DS",
      CTX_AREA_FK200: "",
      CTX_AREA_NK200: "",
    });
    const kiRes = await fetch(`${url}?${qs.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${kiAccessToken}`,
        appkey: account.api_key,
        appsecret: apiSecret,
        tr_id: trId,
      },
    });
    const json = (await kiRes.json()) as unknown;
    if (!kiRes.ok) {
      return NextResponse.json(
        { error: "KI request failed", detail: json },
        { status: 502 }
      );
    }

    // Shape: output is likely output1 list of orders. Build symbol->bool map.
    type OrderItem = {
      ovrs_pdno?: string;
      pdno?: string;
      symb?: string;
      stck_shrn_iscd?: string;
    };
    type MaybeList = {
      output?: unknown;
      output1?: unknown;
      rt_cd?: string;
      msg_cd?: string;
      msg1?: string;
    };
    const out = json as MaybeList;
    const getList = (src: unknown): OrderItem[] =>
      Array.isArray(src) ? (src as OrderItem[]) : [];
    const listRaw: OrderItem[] = getList(out.output) ?? getList(out.output1);
    const symbols: Record<string, boolean> = {};
    for (const it of listRaw) {
      const code: string | undefined =
        it?.ovrs_pdno || it?.pdno || it?.symb || it?.stck_shrn_iscd;
      if (code) symbols[String(code).toUpperCase()] = true;
    }
    const meta = out as MaybeList;
    return NextResponse.json({
      rt_cd: meta.rt_cd,
      msg_cd: meta.msg_cd,
      msg1: meta.msg1,
      symbols,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
