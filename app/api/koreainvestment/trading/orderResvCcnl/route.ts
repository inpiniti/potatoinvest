import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from '@/utils/crypto';

export async function POST(request: NextRequest) {
  const {
    appkey, // 앱키
    appsecret, // 앱시크릿키
    solt,
    token, // 접근토큰
    tr, // 거래ID '매수', '매도'
    isVts = true, // 모의투자 여부

    CANO, // 종합계좌번호 ex) 810XXXXX
    ACNT_PRDT_CD, // 계좌상품코드 ex) 01
    OVRS_EXCG_CD, // 해외거래소코드 ex) NASD, NYSE, AMEX
    PDNO, // 종목코드 ex) 009150
    ORD_QTY, // 주문수량 ex) 3
    OVRS_ORD_UNPR, // 해외주문단가 ex) 150000
    ORD_SVR_DVSN_CD = '0', // 주문서버구분코드 ex) 0
    ORD_DVSN = '00', // 주문구분 ex) 00: 지정가
  } = await request.json();

  const port = isVts ? '29443' : '9443';
  const domain = isVts ? 'openapivts' : 'openapi';
  const endpoint = 'uapi/overseas-stock/v1/trading/order';
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const trIds = {
    실전매수: 'TTTT1002U',
    실전매도: 'TTTT1006U',
    모의매수: 'VTTT1002U',
    모의매도: 'VTTT1001U',
  };

  const trId = isVts
    ? tr === '매수'
      ? trIds.모의매수
      : tr === '매도'
      ? trIds.모의매도
      : ''
    : tr === '매수'
    ? trIds.실전매수
    : tr === '매도'
    ? trIds.실전매도
    : '';

  const payload = {
    CANO, // 종합계좌번호
    ACNT_PRDT_CD, // 계좌상품코드
    OVRS_EXCG_CD, // 해외거래소코드
    PDNO, // 상품번호
    ORD_QTY, // 주문수량
    OVRS_ORD_UNPR, // 해외주문단가
    ORD_SVR_DVSN_CD, // 주문서버구분코드
    ORD_DVSN, // 주문구분
  };

  try {
    const queryParams = new URLSearchParams(payload);
    console.log({
      appkey: decrypt(solt, appkey),
      appsecret,
      solt,
      token,
      url,
      trId,
      queryParams,
    });

    // const response = await fetch(`${url}?${queryParams.toString()}`, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json; charset=UTF-8",
    //     Authorization: `Bearer ${token}`,
    //     appkey: decrypt(solt, appkey),
    //     appsecret: decrypt(solt, appsecret),
    //     tr_id: trId, // 거래ID
    //   },
    // });

    // const data = await response.json();

    return NextResponse.json(
      '해외주식 예약주문접수취소 : 서버에서 내려준 값입니다.'
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
