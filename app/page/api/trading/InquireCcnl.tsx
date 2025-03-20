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
import OVRS_EXCG_CD_COMPONENT from "./common/OVRS_EXCG_CD_COMPONENT";
import DATE_COMPONENT from "./common/DATE_COMPONENT";
import dayjs from "dayjs";

const InquireCcnl = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [PDNO, setPDNO] = useState("%");
  const [ORD_STRT_DT, setORD_STRT_DT] = useState(dayjs().format("YYYYMMDD")); // 주문수량
  const [ORD_END_DT, setORD_END_DT] = useState(dayjs().format("YYYYMMDD")); // 주문수량
  const [SLL_BUY_DVSN, setSLL_BUY_DVSN] = useState("00"); // 주문단가
  const [CCLD_NCCS_DVSN, setCCLD_NCCS_DVSN] = useState("00"); // 주문단가
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState("NASD");
  const [SORT_SQN, setSORT_SQN] = useState("DS");

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    ORD_STRT_DT,
    ORD_END_DT,
    SLL_BUY_DVSN,
    CCLD_NCCS_DVSN,
    SORT_SQN,
    ORD_DT: "",
    ORD_GNO_BRNO: "",
    ODNO: "",
    CTX_AREA_NK200: "",
    CTX_AREA_FK200: "",
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.inquireCcnl(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 주문체결내역"
      endPoint="/trading/inquireCcnl"
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
              value={PDNO}
              onChange={setPDNO}
              title="종목 코드"
              column="PDNO"
              items={["%", "AAPL", "TSLA"]}
            />
            <DATE_COMPONENT
              value={ORD_STRT_DT}
              onChange={setORD_STRT_DT}
              title="주문시작일자"
              column="ORD_STRT_DT"
            />
            <DATE_COMPONENT
              value={ORD_END_DT}
              onChange={setORD_END_DT}
              title="주문종료일자"
              column="ORD_END_DT"
            />
            <TAB_COMPONENT
              value={SLL_BUY_DVSN}
              onChange={setSLL_BUY_DVSN}
              title="매도매수구분"
              column="SLL_BUY_DVSN"
              items={["00", "01", "02"]}
            />
            <TAB_COMPONENT
              value={CCLD_NCCS_DVSN}
              onChange={setCCLD_NCCS_DVSN}
              title="체결미체결구분"
              column="CCLD_NCCS_DVSN"
              items={["00", "01", "02"]}
            />
            <OVRS_EXCG_CD_COMPONENT
              value={OVRS_EXCG_CD}
              onChange={setOVRS_EXCG_CD}
            />
            <TAB_COMPONENT
              value={SORT_SQN}
              onChange={setSORT_SQN}
              title="정렬순서"
              column="SORT_SQN"
              items={["DS", "AS"]}
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

export default InquireCcnl;
