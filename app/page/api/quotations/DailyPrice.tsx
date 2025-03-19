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
import { Label } from "@/components/ui/label";

import { useState } from "react";
import ApiContent from "../ApiContent";
import useApi from "@/hooks/useApi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DailyPrice = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [excd, setExcd] = useState("");
  const [symb, setSymb] = useState("");
  const [gubn, setGubn] = useState("0");
  const [modp, setModp] = useState("0");

  const handleButtonClick = async () => {
    const body = {
      excd: excd,
      symb: symb,
      gubn: gubn,
      modp: modp,
    };

    try {
      const response = await api.quotations.dailyprice(body);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 기간별시세"
      endPoint="/quotations/dailyprice"
      disabled={false}
      result={result}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>해외주식 기간별 시세</DrawerTitle>
            <DrawerDescription>/quotations/dailyprice</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excd">거래소 코드 : EXCD ({excd})</Label>
              <Tabs defaultValue="account" value={excd} onValueChange={setExcd}>
                <TabsList>
                  <TabsTrigger value="HKS">홍콩</TabsTrigger>
                  <TabsTrigger value="NYS">뉴욕</TabsTrigger>
                  <TabsTrigger value="NAS">나스닥</TabsTrigger>
                  <TabsTrigger value="AMS">아멕스</TabsTrigger>
                  <TabsTrigger value="TSE">도쿄</TabsTrigger>
                  <TabsTrigger value="SHS">상해</TabsTrigger>
                  <TabsTrigger value="SZS">심천</TabsTrigger>
                  <TabsTrigger value="SHI">상해지수</TabsTrigger>
                  <TabsTrigger value="SZI">심천지수</TabsTrigger>
                  <TabsTrigger value="HSX">호치민</TabsTrigger>
                  <TabsTrigger value="HNX">하노이</TabsTrigger>
                  <TabsTrigger value="BAY">뉴욕(주간)</TabsTrigger>
                  <TabsTrigger value="BAQ">나스닥(주간)</TabsTrigger>
                  <TabsTrigger value="BAA">아멕스(주간)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="symb">종목 코드 : SYMB ({symb})</Label>
              <Tabs defaultValue="account" value={symb} onValueChange={setSymb}>
                <TabsList>
                  <TabsTrigger value="AAPL">애플</TabsTrigger>
                  <TabsTrigger value="TSLA">테슬라</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="gubn">구분 : GUBN ({gubn})</Label>
              <Tabs defaultValue="account" value={gubn} onValueChange={setGubn}>
                <TabsList>
                  <TabsTrigger value="0">일</TabsTrigger>
                  <TabsTrigger value="1">주</TabsTrigger>
                  <TabsTrigger value="2">월</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="modp">수정주가반영여부 : MODP ({modp})</Label>
              <Tabs defaultValue="account" value={modp} onValueChange={setModp}>
                <TabsList>
                  <TabsTrigger value="0">미반영</TabsTrigger>
                  <TabsTrigger value="1">반영</TabsTrigger>
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

export default DailyPrice;
