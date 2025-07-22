import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const Buy = ({ priceDetailData }) => {
  const [priceType, setPriceType] = useState("current"); // 기준가격
  const [buyQuantity, setBuyQuantity] = useState("1"); // 구매수량
  const [buyRatio, setBuyRatio] = useState("0"); // 가격조정
  // 개당가격
  const pricePerUnit = useMemo(() => {
    return (priceDetailData?.last * (1 + buyRatio / 100))?.toFixed(2);
  }, [priceDetailData, buyRatio]);

  const totalPrice = useMemo(() => {
    return (
      priceDetailData?.last *
      buyQuantity *
      (1 + buyRatio / 100)
    )?.toFixed(2);
  }, [priceDetailData, buyQuantity, buyRatio]);
  // 원화가격
  const totalPriceKRW = useMemo(() => {
    return (totalPrice * 1500)?.toFixed(0);
  }, [totalPrice]);

  return (
    <div className="py-2 flex flex-col gap-4 w-96">
      <div className="flex items-center gap-2">
        <Label className="shrink-0 font-bold text-neutral-700">기준가격</Label>
        <Input value={priceDetailData?.last} />
      </div>
      <div className="flex items-start gap-2">
        <Label className="shrink-0 font-bold text-neutral-700 pt-2">
          구매기준
        </Label>
        <Tabs value={priceType} onValueChange={setPriceType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">현재 가격</TabsTrigger>
            <TabsTrigger value="buy">구매 가격</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-start gap-2">
        <Label className="shrink-0 font-bold text-neutral-700 pt-2">
          가격조정
        </Label>
        <Tabs value={buyRatio} onValueChange={setBuyRatio} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="0">0%</TabsTrigger>
            <TabsTrigger value="-1">-1%</TabsTrigger>
            <TabsTrigger value="-2">-2%</TabsTrigger>
            <TabsTrigger value="-3">-3%</TabsTrigger>
            <TabsTrigger value="-5">-5%</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 font-bold text-neutral-700">개당가격</Label>
        <Input value={pricePerUnit} />
      </div>
      <div className="flex items-start gap-2">
        <Label className="shrink-0 font-bold text-neutral-700 pt-2">
          구매수량
        </Label>
        <div class="flex flex-col gap-2 w-full">
          <Input value={buyQuantity} />
          <Tabs
            value={buyQuantity}
            onValueChange={setBuyQuantity}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="1">1개</TabsTrigger>
              <TabsTrigger value="10">10만원치</TabsTrigger>
              <TabsTrigger value="100">구매한 만큼</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 font-bold text-neutral-700">달러가격</Label>
        <Input value={totalPrice} />
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 font-bold text-neutral-700">원화가격</Label>
        <Input value={totalPriceKRW} />
      </div>
      <Button variant="destructive">구매</Button>
    </div>
  );
};

export default Buy;
