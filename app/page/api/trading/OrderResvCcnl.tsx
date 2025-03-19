import { Button } from '@/components/ui/button';

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

import { useState } from 'react';
import ApiContent from '../ApiContent';
import useApi from '@/hooks/useApi';

const OrderResvCcnl = () => {
  const api = useApi();

  const [result, setResult] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [payload] = useState({
    CANO: '50127423', // 종합계좌번호 ex) 810XXXXX
    ACNT_PRDT_CD: '01', // 계좌상품코드 ex) 01
    OVRS_EXCG_CD: 'NASD', // 해외거래소코드 ex) NASD, NAS : 나스닥,    NYSE, AMEX
    TR_CRCY_CD: 'USD', // 통화코드 ex) USD
    CTX_AREA_FK200: '', // 연속조회검색조건200 ex) 3
    CTX_AREA_NK200: '', // 연속조회키200 ex) 150000
  });

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.orderResvCcnl(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 예약주문접수취소"
      endPoint="/trading/orderResvCcnl"
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
          <div className="px-4 flex flex-col gap-4"></div>
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

export default OrderResvCcnl;
