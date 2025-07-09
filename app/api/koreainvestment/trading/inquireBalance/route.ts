import { NextResponse, NextRequest } from "next/server";
import { decrypt } from "@/utils/crypto";

export async function POST(request: NextRequest) {
  const {
    appkey, // 앱키
    appsecret, // 앱시크릿키
    solt,
    token, // 접근토큰
    isVts = true, // 모의투자 여부

    CANO, // 종합계좌번호 ex) 810XXXXX
    ACNT_PRDT_CD, // 계좌상품코드 ex) 01
    OVRS_EXCG_CD, // 해외거래소코드 ex) NASD, NYSE, AMEX
    TR_CRCY_CD, // 통화코드 ex) USD
    CTX_AREA_FK200, // 연속조회검색조건200 ex) ''
    CTX_AREA_NK200, // 연속조회키200 ex) ''
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-stock/v1/trading/inquire-balance";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const trIds = {
    실전: "TTTS3012R",
    모의: "VTTS3012R",
  };

  const trId = isVts ? trIds.모의 : trIds.실전;

  const payload = {
    CANO, // 종합계좌번호
    ACNT_PRDT_CD, // 계좌상품코드
    OVRS_EXCG_CD, // 해외거래소코드
    TR_CRCY_CD, // 통화코드
    CTX_AREA_FK200, // 연속조회검색조건200
    CTX_AREA_NK200, // 연속조회키200
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
