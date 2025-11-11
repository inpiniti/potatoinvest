import { Label } from "@/components/ui/label";
import { keyStore } from "@/store/keyStore";
import { useEffect } from "react";

const CANO_COMPONENT = ({
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
      onChange(vtsAccountList[0]);
    } else {
      const accountList = _key.account.split("-");
      onChange(accountList[0]);
    }
  }, []);

  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="CANO">종합계좌번호 : CANO ( {value} )</Label>
    </div>
  );
};
export default CANO_COMPONENT;
