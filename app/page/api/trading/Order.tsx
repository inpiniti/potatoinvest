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

import { useEffect, useState } from "react";
import ApiContent from "../ApiContent";
import useApi from "@/hooks/useApi";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { keyStore } from "@/store/keyStore";

const Order = () => {
  const { key, getKey } = keyStore();

  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [tr, setTr] = useState("");
  const [CANO, setCANO] = useState(""); // 종합계좌번호 ex) 810XXXX
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState(""); // 계좌상품코드 ex) 01
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState(""); // 해외거래소코드 ex) NASD, NAS : 나스닥,  NYSE, AMEX
  const [PDNO, setPDNO] = useState(""); // 종목코드 ex) 1
  const [ORD_QTY, setORD_QTY] = useState(""); // 주문수량 ex) 1
  const [OVRS_ORD_UNPR, setOVRS_ORD_UNPR] = useState(""); // 해외주문단가 ex) 1

  useEffect(() => {
    const _key = getKey();

    if (key.isVts === true) {
      const vtsAccountList = _key.vtsAccount.split("-");
      setCANO(vtsAccountList[0]);
      setACNT_PRDT_CD(vtsAccountList[1]);
    } else {
      const accountList = _key.account.split("-");
      setCANO(accountList[0]);
      setACNT_PRDT_CD(accountList[1]);
    }
  }, []);

  const payload = {
    tr,
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    ORD_QTY,
    OVRS_ORD_UNPR,
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.order(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 주문"
      endPoint="/trading/order"
      disabled={false}
      result={result}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger>
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
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="tr">메수&메도 : tr ( {tr} )</Label>
              <Tabs defaultValue="tr" value={tr} onValueChange={setTr}>
                <TabsList>
                  <TabsTrigger value="매수">매수</TabsTrigger>
                  <TabsTrigger value="매도">매도</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="CANO">종합계좌번호 : CANO ( {CANO} )</Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="ACNT_PRDT_CD">
                계좌상품코드 : ACNT_PRDT_CD ( {ACNT_PRDT_CD} )
              </Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="OVRS_EXCG_CD">
                해외거래소코드 : OVRS_EXCG_CD ( {OVRS_EXCG_CD} )
              </Label>
              <Tabs
                defaultValue="OVRS_EXCG_CD"
                value={OVRS_EXCG_CD}
                onValueChange={setOVRS_EXCG_CD}
              >
                <TabsList>
                  <TabsTrigger value="NASD">나스닥</TabsTrigger>
                  <TabsTrigger value="NYSE">뉴욕</TabsTrigger>
                  <TabsTrigger value="AMEX">아멕스</TabsTrigger>
                  <TabsTrigger value="SEHK">홍콩</TabsTrigger>
                  <TabsTrigger value="SHAA">상해</TabsTrigger>
                  <TabsTrigger value="SZAA">심천</TabsTrigger>
                  <TabsTrigger value="TKSE">일본</TabsTrigger>
                  <TabsTrigger value="HASE">베트남 하노이</TabsTrigger>
                  <TabsTrigger value="VNSE">베트남 호치민</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="PDNO">종목 코드 : PDNO ( {PDNO} )</Label>
              <Tabs defaultValue="PDNO" value={PDNO} onValueChange={setPDNO}>
                <TabsList>
                  <TabsTrigger value="AAPL">애플</TabsTrigger>
                  <TabsTrigger value="TSLA">테슬라</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="ORD_QTY">주문수량 : ORD_QTY ( {ORD_QTY} )</Label>
              <Tabs
                defaultValue="ORD_QTY"
                value={ORD_QTY}
                onValueChange={setORD_QTY}
              >
                <TabsList>
                  <TabsTrigger value="1">1</TabsTrigger>
                  <TabsTrigger value="2">2</TabsTrigger>
                  <TabsTrigger value="3">3</TabsTrigger>
                  <TabsTrigger value="4">4</TabsTrigger>
                  <TabsTrigger value="5">5</TabsTrigger>
                  <TabsTrigger value="6">6</TabsTrigger>
                  <TabsTrigger value="7">7</TabsTrigger>
                  <TabsTrigger value="8">8</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="OVRS_ORD_UNPR">
                해외주문단가 : OVRS_ORD_UNPR ( {OVRS_ORD_UNPR} )
              </Label>
              <Tabs
                defaultValue="OVRS_ORD_UNPR"
                value={OVRS_ORD_UNPR}
                onValueChange={setOVRS_ORD_UNPR}
              >
                <TabsList>
                  <TabsTrigger value="1">1</TabsTrigger>
                  <TabsTrigger value="2">2</TabsTrigger>
                  <TabsTrigger value="3">3</TabsTrigger>
                  <TabsTrigger value="4">4</TabsTrigger>
                  <TabsTrigger value="5">5</TabsTrigger>
                  <TabsTrigger value="6">6</TabsTrigger>
                  <TabsTrigger value="7">7</TabsTrigger>
                  <TabsTrigger value="8">8</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
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

export default Order;
