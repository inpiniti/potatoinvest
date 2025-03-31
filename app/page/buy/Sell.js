"use client";

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

import { Button } from "@/components/ui/button";
import { useState } from "react";
import useTrading from "@/hooks/useTrading";

const Sell = ({
  ovrs_pdno,
  ovrs_item_name,
  pchs_avg_pric,
  ovrs_cblc_qty,
  evlu_pfls_rt,
}) => {
  const { 매도 } = useTrading();

  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button>매도</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{ovrs_pdno}</DrawerTitle>
          <DrawerDescription>{ovrs_item_name}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex gap-2">
          <div>매입가 : {pchs_avg_pric}, </div>
          <div>수량 : {ovrs_cblc_qty}, </div>
          <div>수익률 : {evlu_pfls_rt}</div>
        </div>
        <div className="px-4 flex flex-col gap-2 py-4">
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                매도({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.02).toFixed(2),
                })
              }
            >
              2%({(pchs_avg_pric * 1.02).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400">
              -2%({(pchs_avg_pric * 0.98).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                매도({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.05).toFixed(2),
                })
              }
            >
              5%({(pchs_avg_pric * 1.05).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400">
              -5%({(pchs_avg_pric * 0.95).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                매도({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.1).toFixed(2),
                })
              }
            >
              10%({(pchs_avg_pric * 1.1).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400">
              -10%({(pchs_avg_pric * 0.9).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                매도({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.3).toFixed(2),
                })
              }
            >
              30%({(pchs_avg_pric * 1.3).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400">
              -30%({(pchs_avg_pric * 0.7).toFixed(2)})에 매수
            </Button>
          </div>
        </div>
        <DrawerFooter>
          <div className="flex items-center justify-end w-full gap-2">
            <DrawerClose>
              <Button variant="outline">취소</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Sell;
