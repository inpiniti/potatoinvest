'use client';

import { tempKeyStore } from '@/store/tempKeyStore';
import useApi from '@/hooks/useApi';
import { delay } from '@/utils/util';
import { keyStore } from '@/store/keyStore';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const useToken = () => {
  const api = useApi();
  const {
    key: { isVts },
  } = keyStore();
  const { key, setKey, realKey, setRealKey, _hasHydrated } = tempKeyStore();

  // 로컬 상태로 하이드레이션 완료 여부 추적
  const [isReady, setIsReady] = useState(false);

  // 하이드레이션 상태 감지
  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);
      console.log('🔥 토큰 스토어 준비됨:', { key, realKey });
    }
  }, [_hasHydrated, key, realKey]);

  /**
   * 발급된 토큰이 있는지 확인하고 유효한지 검사
   * 토큰이 있고 유효하면 true, 없거나 만료되었으면 false
   */
  const 발급된토큰확인 = async (): Promise<boolean> => {
    await delay(500);

    console.log('isVts:', isVts);

    // 계정 타입에 따른 토큰 정보 확인
    const tokenInfo = isVts ? key : realKey;

    console.log('tokenInfo:', tokenInfo);
    console.log('key:', key);
    console.log('realKey:', realKey);

    // 토큰이 없으면 false 반환
    if (!tokenInfo.access_token) {
      return false;
    }

    // 토큰 만료 시간 확인
    const expiryDate = tokenInfo?.access_token_token_expired;

    if (expiryDate) {
      const expiry = dayjs(expiryDate);
      const now = dayjs();

      // 토큰이 유효한 경우 (만료 시간이 현재보다 나중)
      if (expiry.isAfter(now)) {
        return true;
      }
    }

    // 토큰이 없거나 만료된 경우
    return false;
  };

  /**
   * 토큰 발급
   * 계정 타입에 따라 모의투자 또는 실전 토큰 발급
   */
  const 토큰발급 = async () => {
    let success = true;

    // 모의투자 계정인 경우 모의투자 토큰 발급
    if (isVts) {
      const response = await api.oauth2.tokenP();
      const data = await response.json();

      if (response.status !== 200) {
        console.error('모의투자 토큰 발급 실패', response.status, data);
        success = false;
      } else {
        setKey({
          ...key,
          ...data,
        });
      }
    }

    // 실전토큰 발급 (모의투자 계정이라도 실전토큰은 항상 발급)
    const response = await api.oauth2.tokenR();
    const data = await response.json();

    if (response.status !== 200) {
      console.error('실전 토큰 발급 실패', response.status, data);
      if (!isVts) {
        // 실전 계정인 경우에만 실패로 간주
        success = false;
      }
    } else {
      setRealKey({
        ...realKey,
        ...data,
      });
    }

    return success;
  };

  /**
   * 토큰의 남은 시간을 확인
   * 현재 사용 중인 계정 타입(모의투자/실전)에 따라 적절한 토큰 확인
   *
   * @returns {boolean} 토큰이 유효하면 true, 만료되었으면 false
   */
  const 토큰남은시간확인 = async () => {
    await delay(500);

    // 계정 타입에 따라 토큰 선택
    const tokenInfo = isVts ? key : realKey;
    const expiryDate = tokenInfo?.access_token_token_expired;

    if (!expiryDate) {
      return false;
    }

    const expiry = dayjs(expiryDate);
    const now = dayjs();

    return expiry.isAfter(now);
  };

  return { 발급된토큰확인, 토큰발급, 토큰남은시간확인, isReady };
};

export default useToken;
