import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  const { appkey, appsecret, solt, token, excd, symb, gubn, modp } =
    await request.json();

  const url =
    "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/dailyprice";
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
  } catch (error) {
    return NextResponse.json(error);
  }
}
