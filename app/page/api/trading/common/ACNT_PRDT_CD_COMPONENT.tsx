import { Label } from "@/components/ui/label";
import { keyStore } from "@/store/keyStore";
import { useEffect } from "react";

const ACNT_PRDT_CD_COMPONENT = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { key, getKey } = keyStore();

  useEffect(() => {
    const _key = getKey();

    if (key.isVts === true) {
      const vtsAccountList = _key.vtsAccount.split("-");
      onChange(vtsAccountList[1]);
    } else {
      const accountList = _key.account.split("-");
      onChange(accountList[1]);
    }
  }, []);

  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="ACNT_PRDT_CD">
        계좌상품코드 : ACNT_PRDT_CD ( {value} )
      </Label>
    </div>
  );
};
export default ACNT_PRDT_CD_COMPONENT;
