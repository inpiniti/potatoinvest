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
import INPUT_COMPONENT from "./common/INPUT_COMPONENT";

const OrderResvCcnl = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [RSYN_ORD_RCIT_DT, setRSYN_ORD_RCIT_DT] = useState("20211124");
  const [OVRS_RSVN_ODNO, setOVRS_RSVN_ODNO] = useState("30135682");

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    RSYN_ORD_RCIT_DT,
    OVRS_RSVN_ODNO,
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.orderResvCcnl(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 예약주문접수취소"
      endPoint="/trading/orderResvCcnl"
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
            <INPUT_COMPONENT
              value={RSYN_ORD_RCIT_DT}
              onChange={setRSYN_ORD_RCIT_DT}
              title="예약주문접수일자"
              column="RSYN_ORD_RCIT_DT"
            />
            <INPUT_COMPONENT
              value={OVRS_RSVN_ODNO}
              onChange={setOVRS_RSVN_ODNO}
              title="해외예약주문번호"
              column="OVRS_RSVN_ODNO"
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

export default OrderResvCcnl;
