'use client';

import { keyStore } from '@/store/keyStore';
import { delay } from '@/utils/util';

const useKey = () => {
  const { key } = keyStore();

  // 1. 발급받은 키가 있는가?
  const 발급받은키확인 = async () => {
    await delay(500);

    // 모의계좌이면서, 모의키, 모의시크릿키
    if (key.isVts && key.vtsAppKey && key.vtsSecretKey) {
      return true;
    }

    // 실전계좌이면서, 실전키, 실전시크릿키
    if (!key.isVts && key.appKey && key.secretKey) {
      return true;
    }

    return false;
  };

  return { 발급받은키확인 };
};

export default useKey;
