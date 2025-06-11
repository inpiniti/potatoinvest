import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from '@/utils/crypto';

export async function POST(request: NextRequest) {
  const {
    appkey,
    appsecret,
    solt,
    token,
    PRDT_TYPE_CD,
    PDNO,
    isVts = true,
  } = await request.json();

  const port = isVts ? '29443' : '9443';
  const domain = isVts ? 'openapivts' : 'openapi';
  const endpoint = 'uapi/overseas-price/v1/quotations/search-info';
  const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;

  const payload = {
    PRDT_TYPE_CD,
    PDNO,
  };

  try {
    const queryParams = new URLSearchParams(payload);

    const response = await fetch(`${url}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        authorization: `Bearer ${token}`,
        appkey: decrypt(solt, appkey),
        appsecret: decrypt(solt, appsecret),
        tr_id: 'CTPF1702R',
        custtype: 'P',
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
