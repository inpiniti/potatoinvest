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
    const {
      accountId,
      kiAccessToken,
      excd,
      symb,
      nmin = "5",
      nrec = "120",
    } = body;

    if (!accountId || !kiAccessToken || !excd || !symb) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    const { data: account, error } = await admin
      .from("brokerage_accounts")
      .select("id, api_key, secret_key_enc")
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

    const url =
      "https://openapivts.koreainvestment.com:29443/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice";
    const params = new URLSearchParams({
      AUTH: "",
      EXCD: excd,
      SYMB: symb,
      NMIN: nmin, // 분봉 (5분봉)
      PINC: "1",
      NEXT: "",
      NREC: nrec, // 최대 조회 레코드 (120)
      FILL: "",
      KEYB: "",
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${kiAccessToken}`,
        appkey: account.api_key,
        appsecret: secret,
        tr_id: "HHDFS76950200",
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
