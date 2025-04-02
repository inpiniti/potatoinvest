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
import { toast } from "sonner"; // 추가: 토스트 메시지

const Sell = ({
  ovrs_pdno,
  ovrs_item_name,
  pchs_avg_pric,
  ovrs_cblc_qty,
  evlu_pfls_rt,
  onSellComplete, // 추가: 매도 완료 후 호출할 콜백 함수
}) => {
  const { 매도 } = useTrading();
  const [loading, setLoading] = useState(false); // 추가: 로딩 상태

  const [isOpen, setIsOpen] = useState(false);

  /**
   * 매도 요청을 처리하는 함수
   * @param {Object} params - 매도 파라미터
   * @returns {Promise<void>}
   */
  const handleSell = async (params) => {
    try {
      setLoading(true); // 로딩 시작
      await 매도(params);
      toast.success("매도 요청이 완료되었습니다.", {
        description: `${params.ovrs_pdno} ${params.ovrs_cblc_qty}주 (${params.now_pric2}$)`,
      });
      setIsOpen(false); // 드로어 닫기

      // 매도 완료 후 부모 컴포넌트에 알림
      if (onSellComplete) {
        onSellComplete();
      }
    } catch (error) {
      console.error("매도 요청 실패:", error);
      toast.error("매도 요청이 실패했습니다.", {
        description: error.message || "다시 시도해주세요.",
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

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
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.02).toFixed(2),
                })
              }
              disabled={loading}
            >
              2%({(pchs_avg_pric * 1.02).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400" disabled={loading}>
              -2%({(pchs_avg_pric * 0.98).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.05).toFixed(2),
                })
              }
              disabled={loading}
            >
              5%({(pchs_avg_pric * 1.05).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400" disabled={loading}>
              -5%({(pchs_avg_pric * 0.95).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.1).toFixed(2),
                })
              }
              disabled={loading}
            >
              10%({(pchs_avg_pric * 1.1).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400" disabled={loading}>
              -10%({(pchs_avg_pric * 0.9).toFixed(2)})에 매수
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-blue-400"
              onClick={() =>
                handleSell({
                  ovrs_pdno,
                  ovrs_cblc_qty,
                  now_pric2: (pchs_avg_pric * 1.3).toFixed(2),
                })
              }
              disabled={loading}
            >
              30%({(pchs_avg_pric * 1.3).toFixed(2)})에 매도
            </Button>
            <Button className="bg-red-400" disabled={loading}>
              -30%({(pchs_avg_pric * 0.7).toFixed(2)})에 매수
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
