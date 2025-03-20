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
    OVRS_EXCG_CD,
    PDNO,
    ORD_STRT_DT,
    ORD_END_DT,
    SLL_BUY_DVSN,
    CCLD_NCCS_DVSN,
    SORT_SQN,
    ORD_DT,
    ORD_GNO_BRNO,
    ODNO,
    CTX_AREA_NK200,
    CTX_AREA_FK200,
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-stock/v1/trading/inquire-ccnl";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const trIds = {
    실전: "TTTS3035R",
    모의: "VTTS3035R",
  };

  const trId = isVts ? trIds.모의 : trIds.실전;

  const payload = {
    CANO, // 종합계좌번호
    ACNT_PRDT_CD, // 계좌상품코드
    OVRS_EXCG_CD, // 해외거래소코드
    PDNO, // 상품번호
    ORD_STRT_DT,
    ORD_END_DT,
    SLL_BUY_DVSN,
    CCLD_NCCS_DVSN,
    SORT_SQN,
    ORD_DT,
    ORD_GNO_BRNO,
    ODNO,
    CTX_AREA_NK200,
    CTX_AREA_FK200,
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
