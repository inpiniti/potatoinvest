import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import CryptoJS from "crypto-js";

import { useTempKeyStore } from "./useTempKeyStore";

export const useKeyStore = create(
  devtools(
    persist(
      (set) => ({
        key: {
          appKey: "",
          appSecret: "",
          vtsAppKey: "",
          vtsAppSecret: "",
          approval_key: "", // 웹소캣 접속키
        },
        setKey: (key) => {
          const password = useTempKeyStore.getState().key.password;
          const encryptedKey = {
            appKey: encrypt(password, key.appKey),
            appSecret: encrypt(password, key.appSecret),
            vtsAppKey: encrypt(password, key.vtsAppKey),
            vtsAppSecret: encrypt(password, key.vtsAppSecret),
            approval_key: encrypt(password, key.approval_key),
          };
          set({ key: encryptedKey });
        },
        getKey: () => {
          const password = useTempKeyStore.getState().key.password;
          const key = useKeyStore.getState().key;
          return {
            appKey: decrypt(password, key.appKey),
            appSecret: decrypt(password, key.appSecret),
            vtsAppKey: decrypt(password, key.vtsAppKey),
            vtsAppSecret: decrypt(password, key.vtsAppSecret),
            approval_key: decrypt(password, key.approval_key),
          };
        },
      }),
      {
        name: "key",
        getStorage: () => localStorage,
      }
    ),
    { name: "key" }
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
