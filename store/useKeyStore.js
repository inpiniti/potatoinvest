import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { encrypt, decrypt } from "@/utils/crypto";

import { useTempKeyStore } from "./useTempKeyStore";

export const useKeyStore = create(
  devtools(
    persist(
      (set) => ({
        key: {
          appKey: "",
          secretKey: "",
          vtsAppKey: "",
          vtsSecretKey: "",
          approval_key: "", // 웹소캣 접속키
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
        name: "key",
        getStorage: () => localStorage,
      }
    ),
    { name: "key" }
  )
);
