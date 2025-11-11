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
import OVRS_EXCG_CD_COMPONENT from "./common/OVRS_EXCG_CD_COMPONENT";
import TAB_COMPONENT from "./common/TAB_COMPONENT";

const InquireNccs = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState("NASD");
  const [SORT_SQN, setSORT_SQN] = useState("DS");
  const [CTX_AREA_FK200] = useState("");
  const [CTX_AREA_NK200] = useState("");

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    SORT_SQN, // 정렬순번 : DS : 정순, 그외 : 역순
    CTX_AREA_FK200, // 연속조회검색조건200 : 공란
    CTX_AREA_NK200, // 연속조회키200 : 공란
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.inquireNccs(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 미체결내역"
      endPoint="/trading/inquireNccs"
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
            <OVRS_EXCG_CD_COMPONENT
              value={OVRS_EXCG_CD}
              onChange={setOVRS_EXCG_CD}
            />
            <TAB_COMPONENT
              value={SORT_SQN}
              onChange={setSORT_SQN}
              title="정렬순번"
              column="SORT_SQN"
              items={["DS", ""]}
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

export default InquireNccs;
