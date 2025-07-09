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
    NATN_CD, // 국가코드 : 공란
    CRCY_CD, // 통화코드 : 공란
    PDNO, // 종목코드 ex) 009150
    INQR_STRT_DT, // 조회시작일자
    INQR_END_DT, // 조회종료일자
    WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
    CTX_AREA_FK200, // 연속조회검색조건200 : 공란
    CTX_AREA_NK200, // 연속조회키200 : 공란
  } = await request.json();

  const port = isVts ? "29443" : "9443";
  const domain = isVts ? "openapivts" : "openapi";
  const endpoint = "uapi/overseas-stock/v1/trading/inquire-period-profit";
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  // 연속 조회 여부 판단하여 tr_cont 헤더 설정
  const isContinuousQuery = !!(CTX_AREA_FK200 || CTX_AREA_NK200);

  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: `Bearer ${token}`,
    appkey: decrypt(solt, appkey),
    appsecret: decrypt(solt, appsecret),
    tr_id: "TTTS3039R", // 거래ID
    tr_cont: isContinuousQuery ? "N" : "", // 연속 조회 시 'N', 최초 조회 시 빈 문자열
  };

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    NATN_CD, // 국가코드 : 공란
    CRCY_CD, // 통화코드 : 공란
    PDNO, // 상품번호 : 공란
    INQR_STRT_DT, // 조회시작일자
    INQR_END_DT, // 조회종료일자
    WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
    CTX_AREA_FK200, // 연속조회검색조건200 : 공란
    CTX_AREA_NK200, // 연속조회키200 : 공란
  };

  try {
    const queryParams = new URLSearchParams(payload);
    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: "GET",
      headers,
    });
    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
        "CDN-Cache-Control": "public, s-maxage=3600",
        "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
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
