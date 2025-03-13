import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';

import { useTempKeyStore } from './useTempKeyStore';

export const useKeyStore = create(
  devtools(
    persist(
      (set) => ({
        key: {
          appKey: '',
          secretKey: '',
          vtsAppKey: '',
          vtsSecretKey: '',
          approval_key: '', // 웹소캣 접속키
        },
        setKey: (key) => {
          const password = useTempKeyStore.getState().key.password;
          const filed = key.filed;
          const encryptedKey = {
            ...useKeyStore.getState().key,
            [filed]: encrypt(password, key[filed]),
          };
          set({ key: encryptedKey });
        },
        getKey: () => {
          const password = useTempKeyStore.getState().key.password;
          const key = useKeyStore.getState().key;
          return {
            appKey: decrypt(password, key.appKey),
            secretKey: decrypt(password, key.secretKey),
            vtsAppKey: decrypt(password, key.vtsAppKey),
            vtsSecretKey: decrypt(password, key.vtsSecretKey),
            approval_key: decrypt(password, key.approval_key),
          };
        },
      }),
      {
        name: 'key',
        getStorage: () => localStorage,
      }
    ),
    { name: 'key' }
  )
);

// 암호화 메서드
export const encrypt = (key, value) => {
  return CryptoJS.AES.encrypt(value, key).toString();
};

// 복호화 메서드
export const decrypt = (key, value) => {
  return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
};
