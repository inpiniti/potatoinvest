import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  const {
    appkey,
    appsecret,
    solt,
    token,
    excd,
    symb,
    gubn,
    modp,
    isVts = true,
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-price/v1/quotations/dailyprice";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const payload = {
    AUTH: "",
    EXCD: excd,
    SYMB: symb,
    GUBN: gubn,
    BYMD: "",
    MODP: modp,
  };

  try {
    const queryParams = new URLSearchParams(payload);

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
        appkey: decrypt(solt, appkey),
        appsecret: decrypt(solt, appsecret),
        tr_id: "HHDFS76240000",
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
