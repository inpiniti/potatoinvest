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
    isVts = true,
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-price/v1/quotations/price";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const payload = {
    AUTH: "",
    EXCD: excd,
    SYMB: symb,
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
        tr_id: "FHKST03010100",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        "CDN-Cache-Control": "public, s-maxage=60",
        "Vercel-CDN-Cache-Control": "public, s-maxage=60",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
