import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { encrypt, decrypt } from "@/utils/crypto";

import { tempKeyStore } from "./tempKeyStore";

export const keyStore = create(
  devtools(
    persist(
      (set) => ({
        key: {
          appKey: "",
          secretKey: "",
          vtsAppKey: "",
          vtsSecretKey: "",
          approval_key: "", // 웹소캣 접속키
          isVts: true,
          account: "",
          vtsAccount: "",
        },
        setIsVts: (isVts) => {
          set({ key: { ...keyStore.getState().key, isVts } });
        },
        setKey: (key) => {
          const password = tempKeyStore.getState().key.password;
          const filed = key.filed;
          const encryptedKey = {
            ...keyStore.getState().key,
            [filed]: encrypt(password, key[filed]),
          };
          set({ key: encryptedKey });
        },
        getKey: () => {
          const password = tempKeyStore.getState().key.password;
          const key = keyStore.getState().key;
          return {
            appKey: decrypt(password, key.appKey),
            secretKey: decrypt(password, key.secretKey),
            vtsAppKey: decrypt(password, key.vtsAppKey),
            vtsSecretKey: decrypt(password, key.vtsSecretKey),
            account: decrypt(password, key.account),
            vtsAccount: decrypt(password, key.vtsAccount),
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
