'use client';

import { tempKeyStore } from '@/store/tempKeyStore';
import useApi from '@/hooks/useApi';
import { delay } from '@/utils/util';

const useToken = () => {
  const api = useApi();
  const { key, setKey } = tempKeyStore();

  // 1. 발급된 토큰이 있는지 확인
  const 발급된토큰확인 = async (): Promise<boolean> => {
    await delay(500);
    return !!key.access_token;
  };

  // 2. 없다면 토큰 발급
  const 토큰발급 = async () => {
    const response = await api.oauth2.tokenP();
    const data = await response.json();

    if (response.status !== 200) {
      console.error('토큰 발급 실패', response.status, data);
      return false;
    }

    setKey({
      ...key,
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
