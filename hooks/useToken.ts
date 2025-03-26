"use client";

import { tempKeyStore } from "@/store/tempKeyStore";
import useApi from "@/hooks/useApi";
import { delay } from "@/utils/util";
import { keyStore } from "@/store/keyStore";

const useToken = () => {
  const api = useApi();
  const {
    key: { isVts },
  } = keyStore();
  const { key, setKey, realKey, setRealKey } = tempKeyStore();

  // 1. 발급된 토큰이 있는지 확인
  const 발급된토큰확인 = async (): Promise<boolean> => {
    await delay(500);
    return !!key.access_token;
  };

  // 2. 없다면 토큰 발급
  const 토큰발급 = async () => {
    if (isVts) {
      const response = await api.oauth2.tokenP();
      const data = await response.json();

      console.log("모의");
      if (response.status !== 200) {
        console.error("토큰 발급 실패", response.status, data);
        return false;
      }

      setKey({
        ...key,
        ...data,
      });
    }

    // 모의투자라고 하더라도,

    console.log("실전");
    // 실전토큰도 발급 받는게 좋음
    const response = await api.oauth2.tokenR();
    const data = await response.json();

    if (response.status !== 200) {
      console.error("토큰 발급 실패", response.status, data);
      return false;
    }

    setRealKey({
      ...realKey,
      ...data,
    });

    return true;
  };

  // 3. 남은 시간이 0 이하라면 토큰 재발급
  const 토큰남은시간확인 = async () => {
    await delay(500);

    const expireDate = new Date(key.access_token_token_expired);

    return expireDate > new Date();
  };

  return { 발급된토큰확인, 토큰발급, 토큰남은시간확인 };
};

export default useToken;
