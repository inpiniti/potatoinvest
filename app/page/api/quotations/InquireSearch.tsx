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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const InquireSearch = () => {
  const api = useApi();

  const [result, setResult] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [EXCD, setEXCD] = useState("");

  const handleButtonClick = async () => {
    try {
      const response = await api.quotations.inquireSearch({
        EXCD,
      });
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 조건검색"
      endPoint="/quotations/inquireSearch"
      disabled={false}
      result={result}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>해외주식 조건검색</DrawerTitle>
            <DrawerDescription>/quotations/inquireSearch</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-4">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="excd">거래소 코드 : EXCD ({EXCD})</Label>
              <Tabs defaultValue="account" value={EXCD} onValueChange={setEXCD}>
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

export default InquireSearch;
