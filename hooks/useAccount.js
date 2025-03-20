"use client";

import { keyStore } from "@/store/keyStore";

const useAccount = () => {
  const { key, getKey } = keyStore();
  const _key = getKey();

  if (key.isVts === true) {
    const vtsAccountList = _key.vtsAccount.split("-");
    return [vtsAccountList[0], vtsAccountList[1]];
  } else {
    const accountList = _key.account.split("-");
    return [accountList[0], accountList[1]];
  }
};

export default useAccount;
