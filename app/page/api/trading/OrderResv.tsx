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

import ApiContent from "../ApiContent";
import useApi from "@/hooks/useApi";
import OVRS_EXCG_CD_COMPONENT from "./common/OVRS_EXCG_CD_COMPONENT";
import TAB_COMPONENT from "./common/TAB_COMPONENT";
import CANO_COMPONENT from "./common/CANO_COMPONENT";
import ACNT_PRDT_CD_COMPONENT from "./common/ACNT_PRDT_CD_COMPONENT";
import { useState } from "react";

const OrderResv = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [tr, setTr] = useState("매수");
  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [PDNO, setPDNO] = useState("AAPL");
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState("NASD");
  const [FT_ORD_QTY, setFT_ORD_QTY] = useState("1"); // 주문수량
  const [FT_ORD_UNPR3, setFT_ORD_UNPR3] = useState("148.00"); // 주문단가

  const payload = {
    tr,
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    FT_ORD_QTY,
    FT_ORD_UNPR3,
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.orderResv(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 예약주문접수"
      endPoint="/trading/orderResv"
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
            <TAB_COMPONENT
              value={tr}
              onChange={setTr}
              title="거래유형"
              column="tr"
              items={["매수", "매도"]}
            />
            <CANO_COMPONENT value={CANO} onChange={setCANO} />
            <ACNT_PRDT_CD_COMPONENT
              value={ACNT_PRDT_CD}
              onChange={setACNT_PRDT_CD}
            />
            <OVRS_EXCG_CD_COMPONENT
              value={OVRS_EXCG_CD}
              onChange={setOVRS_EXCG_CD}
            />
            <TAB_COMPONENT
              value={PDNO}
              onChange={setPDNO}
              title="종목 코드"
              column="PDNO"
              items={["AAPL", "TSLA"]}
            />
            <TAB_COMPONENT
              value={FT_ORD_QTY}
              onChange={setFT_ORD_QTY}
              title="주문수량"
              column="FT_ORD_QTY"
              items={["1", "2", "3", "4", "5", "6", "7", "8"]}
            />
            <TAB_COMPONENT
              value={FT_ORD_UNPR3}
              onChange={setFT_ORD_UNPR3}
              title="해외주문단가"
              column="FT_ORD_UNPR3"
              items={["1", "2", "3", "4", "5", "6", "7", "8"]}
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

export default OrderResv;
