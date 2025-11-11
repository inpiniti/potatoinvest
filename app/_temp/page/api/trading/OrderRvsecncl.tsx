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
import { keyStore } from "@/store/keyStore";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const OrderRvsecncl = () => {
  const { key, getKey } = keyStore();

  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState("");
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState("");
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState("");
  const [PDNO, setPDNO] = useState("");
  const [ORGN_ODNO, setORGN_ODNO] = useState("");
  const [RVSE_CNCL_DVSN_CD, setRVSE_CNCL_DVSN_CD] = useState("");
  const [ORD_QTY, setORD_QTY] = useState("");
  const [OVRS_ORD_UNPR, setOVRS_ORD_UNPR] = useState("0");

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
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    PDNO,
    ORGN_ODNO,
    RVSE_CNCL_DVSN_CD,
    ORD_QTY,
    OVRS_ORD_UNPR,
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.orderRvsecncl(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 정정취소주문"
      endPoint="/trading/orderRvsecncl"
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
              <Label htmlFor="ORGN_ODNO">
                원주문번호 : ORGN_ODNO ( {ORGN_ODNO} )
              </Label>
              <Input
                value={ORGN_ODNO}
                onChange={(e) => setORGN_ODNO(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="RVSE_CNCL_DVSN_CD">
                정정취소구분코드 : RVSE_CNCL_DVSN_CD ( {RVSE_CNCL_DVSN_CD} )
              </Label>
              <Tabs
                defaultValue="RVSE_CNCL_DVSN_CD"
                value={RVSE_CNCL_DVSN_CD}
                onValueChange={setRVSE_CNCL_DVSN_CD}
              >
                <TabsList>
                  <TabsTrigger value="01">정정</TabsTrigger>
                  <TabsTrigger value="02">취소</TabsTrigger>
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
                  <TabsTrigger value="0">0</TabsTrigger>
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

export default OrderRvsecncl;
