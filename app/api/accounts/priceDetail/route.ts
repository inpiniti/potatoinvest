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
  kiAccessToken: string; // KI OAuth access token
  symb: string; // ticker symbol, e.g., AAPL
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Body = await req.json();
    const { accountId, kiAccessToken, symb } = body || {};
    if (!accountId || !kiAccessToken || !symb) {
      return NextResponse.json(
        { error: "Missing required fields: accountId, kiAccessToken, symb" },
        { status: 400 }
      );
    }
    // KIS expects class tickers like BRK.B as BRK/B, sometimes data providers send ',' too.
    // Normalize by replacing '.' or ',' with '/' for KIS queries.
    const symbKis = symb.replace(/[.,]/g, "/");

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
    const endpoint = "uapi/overseas-price/v1/quotations/price-detail";
    const baseUrl = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;
    const trId = "HHDFS76200200";

    async function callWithExcd(excd: "NAS" | "NYS") {
      const qs = new URLSearchParams({ AUTH: "", EXCD: excd, SYMB: symbKis });
      const res = await fetch(`${baseUrl}?${qs.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${kiAccessToken}`,
          appkey: (account as typeof account & { api_key: string }).api_key,
          appsecret: apiSecret,
          tr_id: trId,
        },
      });
      const json = await res.json();
      return { ok: res.ok, json } as const;
    }

    function isValidOutput(json: unknown): boolean {
      if (!json || typeof json !== "object") return false;
      const maybeOut = (json as { output?: unknown }).output;
      if (!maybeOut || typeof maybeOut !== "object") return false;
      const last = (maybeOut as { last?: unknown }).last;
      if (typeof last !== "string") return false;
      if (last.trim() === "") return false;
      const n = Number(last);
      return Number.isFinite(n) && n > 0; // last가 숫자이며 양수일 때 정상으로 간주
    }

    // Try NAS first, then fallback to NYS
    const first = await callWithExcd("NAS");
    if (first.ok && first.json?.rt_cd === "0" && isValidOutput(first.json)) {
      return NextResponse.json({ ...first.json, excd_used: "NAS" });
    }
    const second = await callWithExcd("NYS");
    if (second.ok && second.json?.rt_cd === "0" && isValidOutput(second.json)) {
      return NextResponse.json({ ...second.json, excd_used: "NYS" });
    }
    // Neither succeeded; return the last response with details
    return NextResponse.json(
      { error: "Price detail failed", first: first.json, second: second.json },
      { status: 502 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
