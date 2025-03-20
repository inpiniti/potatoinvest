import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useState } from "react";
import ApiContent from "../ApiContent";
import useApi from "@/hooks/useApi";
import ACNT_PRDT_CD_COMPONENT from "./common/ACNT_PRDT_CD_COMPONENT";
import CANO_COMPONENT from "./common/CANO_COMPONENT";
import TAB_COMPONENT from "./common/TAB_COMPONENT";

const InquireBalance = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState("NASD");
  const [TR_CRCY_CD, setTR_CRCY_CD] = useState("USD"); // 거래통화

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    TR_CRCY_CD,
    CTX_AREA_FK200: "",
    CTX_AREA_NK200: "",
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.inquireBalance(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 잔고"
      endPoint="/trading/inquireBalance"
      disabled={false}
      result={result}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>다음정보를 입력해주세요.</DrawerTitle>
            <DrawerDescription>
              거래소 코드와 종목코드는 필수 입니다.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-4">
            <CANO_COMPONENT value={CANO} onChange={setCANO} />
            <ACNT_PRDT_CD_COMPONENT
              value={ACNT_PRDT_CD}
              onChange={setACNT_PRDT_CD}
            />
            <TAB_COMPONENT
              value={OVRS_EXCG_CD}
              onChange={setOVRS_EXCG_CD}
              title="해외거래소코드"
              column="OVRS_EXCG_CD"
              items={["NASD", "NYSE", "AMEX"]}
            />
            <TAB_COMPONENT
              value={TR_CRCY_CD}
              onChange={setTR_CRCY_CD}
              title="거래통화코드"
              column="TR_CRCY_CD"
              items={["USD", "HKD", "CNY", "JPY", "VND"]}
            />
          </div>
          <DrawerFooter>
            <div className="flex items-center justify-end w-full gap-4">
              <Button onClick={handleButtonClick}>조회</Button>
              <DrawerClose>
                <Button variant="outline">취소</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ApiContent>
  );
};

export default InquireBalance;
