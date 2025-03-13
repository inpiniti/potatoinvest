import { NextResponse, NextRequest } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(request: NextRequest) {
  const { appkey, appsecret, solt } = await request.json();

  //const url = "https://openapivts.koreainvestment.com:29443/oauth2/tokenP";
  const url = "https://openapi.koreainvestment.com:9443/oauth2/tokenP";

  const body = {
    grant_type: "client_credentials",
    appkey: decrypt(solt, appkey),
    appsecret: decrypt(solt, appsecret),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
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
  } catch (error) {
    return NextResponse.json(error);
  }
}

// 복호화 메서드
const decrypt = (key: string, value: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(value, key);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedValue) {
      throw new Error("Decryption failed");
    }
    return decryptedValue;
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};
