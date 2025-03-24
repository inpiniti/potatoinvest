'use client';

import { tempKeyStore } from '@/store/tempKeyStore';
import useApi from '@/hooks/useApi';
import { delay } from '@/utils/util';

const useToken = () => {
  const api = useApi();
  const { key } = tempKeyStore();

  // 1. 발급된 토큰이 있는지 확인
  const 발급된토큰확인 = async () => {
    await delay(5000);
    return !!key.access_token;
  };

  // 2. 없다면 토큰 발급
  const 토큰발급 = async () => {
    const response = await api.oauth2.tokenP();
    const data = await response.json();
    setKey({
      ...key,
      ...data,
    });
    return;
  };
  // 3. 발급된 토큰이 있다면 남은 시간 확인
  // 4. 남은 시간이 0 이하라면 토큰 재발급
  const 토큰남은시간확인 = async () => {
    await delay(1000);
    return key.access_token_token_expired > new Date();
  };

  return [발급된토큰확인, 토큰발급, 토큰남은시간확인];
};

export default useToken;
