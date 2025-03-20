import { NextResponse, NextRequest } from 'next/server';
import { decrypt } from '@/utils/crypto';

export async function POST(request: NextRequest) {
  const { appkey, appsecret, solt, isVts = true } = await request.json();

  const port = isVts ? '29443' : '9443';
  const domain = isVts ? 'openapivts' : 'openapi';
  const url = `https://${domain}.koreainvestment.com:${port}/oauth2/tokenP`;

  const body = {
    grant_type: 'client_credentials',
    appkey: decrypt(solt, appkey),
    appsecret: decrypt(solt, appsecret),
  };

  console.log({ url, body });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      access_token_token_expired: data.access_token_token_expired,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
