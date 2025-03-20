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
import CANO_COMPONENT from "./common/CANO_COMPONENT";
import ACNT_PRDT_CD_COMPONENT from "./common/ACNT_PRDT_CD_COMPONENT";
import TAB_COMPONENT from "./common/TAB_COMPONENT";

const InquirePresentBalance = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState("01");
  const [NATN_CD, setNATN_CD] = useState("000");
  const [TR_MKET_CD, setTR_MKET_CD] = useState("00"); // 주문수량
  const [INQR_DVSN_CD, setINQR_DVSN_CD] = useState("00"); // 주문단가

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    WCRC_FRCR_DVSN_CD,
    NATN_CD,
    TR_MKET_CD,
    INQR_DVSN_CD,
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.inquirePresentBalance(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 체결기준현재잔고"
      endPoint="/trading/inquirePresentBalance"
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
              value={WCRC_FRCR_DVSN_CD}
              onChange={setWCRC_FRCR_DVSN_CD}
              title="환헤외통화구분코드"
              column="WCRC_FRCR_DVSN_CD"
              items={["01", "02"]}
            />
            <TAB_COMPONENT
              value={NATN_CD}
              onChange={setNATN_CD}
              title="국가코드"
              column="NATN_CD"
              items={["000", "840", "334", "156", "392", "704"]}
            />
            <TAB_COMPONENT
              value={TR_MKET_CD}
              onChange={setTR_MKET_CD}
              title="거래시장코드"
              column="TR_MKET_CD"
              items={["00", "01", "02", "03", "04", "05"]}
            />
            <TAB_COMPONENT
              value={INQR_DVSN_CD}
              onChange={setINQR_DVSN_CD}
              title="조회구분코드"
              column="INQR_DVSN_CD"
              items={["00", "01", "02"]}
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

export default InquirePresentBalance;
