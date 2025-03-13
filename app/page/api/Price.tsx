import { Button } from "@/components/ui/button";
import { useTempKeyStore } from "@/store/useTempKeyStore";
import { useKeyStore } from "@/store/useKeyStore";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Price = () => {
  const { key: tempKey } = useTempKeyStore();
  const { key } = useKeyStore();

  const [excd, setExcd] = useState("");
  const [symb, setSymb] = useState("");

  const handleButtonClick = async () => {
    const { appKey, secretKey } = key;
    const url = "/api/koreainvestment/quotations/price";
    const body = {
      appkey: appKey,
      appsecret: secretKey,
      solt: tempKey.password,
      token: tempKey.access_token,
      excd: excd,
      symb: symb,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log(data);

      alert("해외주식 현재체결가가 조회되었습니다.");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <section className="flex items-center justify-between p-4">
      <div className="flex gap-4">
        <b>해외주식 현재체결가</b>
        <p>/quotations/price</p>
      </div>
      <Drawer>
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
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excd">
                거래소 코드 : (NYS, NAS, AMS, TSE, HKS, ...)
              </Label>
              <Input
                type="text"
                id="excd"
                value={excd}
                onChange={(e) => setExcd(e.target.value)}
                placeholder="거래소 코드를 입력해주세요."
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="symb">종목 코드 (APPL, TSLA)</Label>
              <Input
                type="text"
                id="symb"
                value={symb}
                onChange={(e) => setSymb(e.target.value)}
                placeholder="종목 코드를 입력해주세요."
              />
            </div>
          </div>
          <DrawerFooter>
            <div className="flex items-center w-full gap-4">
              <Button onClick={handleButtonClick}>조회</Button>
              <DrawerClose>
                <Button variant="outline">취소</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  );
};

export default Price;
