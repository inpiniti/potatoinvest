import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  const {
    appkey, // 앱키
    appsecret, // 앱시크릿키
    solt,
    token, // 접근토큰
    tr, // 거래ID '매수', '매도'
    isVts = true, // 모의투자 여부

    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    FT_ORD_QTY,
    FT_ORD_UNPR3,
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-stock/v1/trading/order-resv";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const trIds = {
    실전매수: "TTTT3014U",
    실전매도: "TTTT3016U",
    모의매수: "VTTT3014U",
    모의매도: "VTTT3016U",
  };

  const trId = isVts
    ? tr === "매수"
      ? trIds.모의매수
      : tr === "매도"
      ? trIds.모의매도
      : ""
    : tr === "매수"
    ? trIds.실전매수
    : tr === "매도"
    ? trIds.실전매도
    : "";

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    FT_ORD_QTY,
    FT_ORD_UNPR3,
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
        tr_id: trId, // 거래ID
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
