import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  const {
    appkey, // 앱키
    appsecret, // 앱시크릿키
    solt,
    token, // 접근토큰
    isVts = true, // 모의투자 여부

    CANO,
    ACNT_PRDT_CD,
    WCRC_FRCR_DVSN_CD,
    NATN_CD,
    TR_MKET_CD,
    INQR_DVSN_CD,
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-stock/v1/trading/inquire-present-balance";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const trIds = {
    실전: "CTRP6504R",
    모의: "VTRP6504R",
  };

  const trId = isVts ? trIds.모의 : trIds.실전;

  const payload = {
    CANO, // 종합계좌번호
    ACNT_PRDT_CD, // 계좌상품코드
    WCRC_FRCR_DVSN_CD,
    NATN_CD,
    TR_MKET_CD,
    INQR_DVSN_CD,
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
