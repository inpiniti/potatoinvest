'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import useTrading from '@/hooks/useTrading';
import { toast } from 'sonner';

const BuyMore = ({
  ovrs_pdno,
  ovrs_item_name,
  pchs_avg_pric,
  ovrs_cblc_qty,
  evlu_pfls_rt,
  onBuyComplete,
}) => {
  const { 매수 } = useTrading();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 매수 요청을 처리하는 함수
   * @param {Object} params - 매수 파라미터
   * @returns {Promise<void>}
   */
  const handleBuy = async (params) => {
    try {
      setLoading(true);
      await 매수(params);
      toast.success('매수 요청이 완료되었습니다.', {
        description: `${params.ovrs_pdno} ${params.ovrs_cblc_qty || 1}주 (${
          params.now_pric2
        }$)`,
      });
      setIsOpen(false);

      if (onBuyComplete) {
        onBuyComplete();
      }
    } catch (error) {
      console.error('매수 요청 실패:', error);
      toast.error('매수 요청이 실패했습니다.', {
        description: error.message || '다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-red-400 hover:bg-red-500">매수</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>매수 - {ovrs_pdno}</DrawerTitle>
          <DrawerDescription>{ovrs_item_name}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex gap-2 flex-wrap">
          <div>현재 매입가 : ${pchs_avg_pric}</div>
          <div>보유 수량 : {ovrs_cblc_qty}주</div>
          <div className={evlu_pfls_rt > 0 ? 'text-red-500' : 'text-blue-500'}>
            수익률 : {evlu_pfls_rt}%
          </div>
        </div>
        <div className="px-4 flex flex-col gap-2 py-4">
          <h3 className="font-medium text-sm mb-2">매수 가격 설정</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              className="bg-red-400 hover:bg-red-500"
              onClick={() =>
                handleBuy({
                  ovrs_pdno,
                  ovrs_cblc_qty: 1, // 기본 1주 매수
                  now_pric2: (pchs_avg_pric * 0.98).toFixed(2),
                })
              }
              disabled={loading}
            >
              -2% (${(pchs_avg_pric * 0.98).toFixed(2)})
            </Button>

            <Button
              className="bg-red-400 hover:bg-red-500"
              onClick={() =>
                handleBuy({
                  ovrs_pdno,
                  ovrs_cblc_qty: 1,
                  now_pric2: (pchs_avg_pric * 0.95).toFixed(2),
                })
              }
              disabled={loading}
            >
              -5% (${(pchs_avg_pric * 0.95).toFixed(2)})
            </Button>

            <Button
              className="bg-red-400 hover:bg-red-500"
              onClick={() =>
                handleBuy({
                  ovrs_pdno,
                  ovrs_cblc_qty: 1,
                  now_pric2: (pchs_avg_pric * 0.9).toFixed(2),
                })
              }
              disabled={loading}
            >
              -10% (${(pchs_avg_pric * 0.9).toFixed(2)})
            </Button>

            <Button
              className="bg-red-400 hover:bg-red-500"
              onClick={() =>
                handleBuy({
                  ovrs_pdno,
                  ovrs_cblc_qty: 1,
                  now_pric2: (pchs_avg_pric * 0.7).toFixed(2),
                })
              }
              disabled={loading}
            >
              -30% (${(pchs_avg_pric * 0.7).toFixed(2)})
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

export default BuyMore;
