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
import { toast } from "sonner";

const Sell = ({
  ovrs_pdno,
  ovrs_item_name,
  pchs_avg_pric,
  ovrs_cblc_qty,
  evlu_pfls_rt,
  onSellComplete,
}) => {
  const { 매도 } = useTrading();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 매도 요청을 처리하는 함수
   * @param {Object} params - 매도 파라미터
   * @returns {Promise<void>}
   */
  const handleSell = async (params) => {
    try {
      setLoading(true);
      await 매도(params);
      toast.success("매도 요청이 완료되었습니다.", {
        description: `${params.ovrs_pdno} ${params.ovrs_cblc_qty}주 (${params.now_pric2}$)`,
      });
      setIsOpen(false);

      if (onSellComplete) {
        onSellComplete();
      }
    } catch (error) {
      console.error("매도 요청 실패:", error);
      toast.error("매도 요청이 실패했습니다.", {
        description: error.message || "다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" className="bg-blue-400 hover:bg-blue-500">
          매도
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>매도 - {ovrs_pdno}</DrawerTitle>
          <DrawerDescription>{ovrs_item_name}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex gap-2 flex-wrap">
          <div>매입가 : ${pchs_avg_pric}</div>
          <div>수량 : {ovrs_cblc_qty}주</div>
          <div className={evlu_pfls_rt > 0 ? "text-red-500" : "text-blue-500"}>
            수익률 : {evlu_pfls_rt}%
          </div>
        </div>
        <div className="px-4 flex flex-col gap-2 py-4">
          <h3 className="font-medium text-sm mb-2">매도 가격 설정</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.02)?.toFixed(2),
                })
              }
              disabled={loading}
            >
              +2% (${(pchs_avg_pric * 1.02)?.toFixed(2)})
            </Button>

            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.05)?.toFixed(2),
                })
              }
              disabled={loading}
            >
              +5% (${(pchs_avg_pric * 1.05)?.toFixed(2)})
            </Button>

            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.1)?.toFixed(2),
                })
              }
              disabled={loading}
            >
              +10% (${(pchs_avg_pric * 1.1)?.toFixed(2)})
            </Button>

            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.3)?.toFixed(2),
                })
              }
              disabled={loading}
            >
              +30% (${(pchs_avg_pric * 1.3)?.toFixed(2)})
            </Button>
          </div>
        </div>
        <DrawerFooter>
          <div className="flex items-center justify-end w-full gap-2">
            <DrawerClose>
              <Button variant="outline" disabled={loading}>
                취소
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default Sell;
