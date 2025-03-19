'use client';

import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Title } from '@/components/title';

import { Button } from '@/components/ui/button';
import TokenP from './TokenP';
import Price from './quotations/Price';
import DailyPrice from './quotations/DailyPrice';

import AccordionSection from '@/components/accordionSection';
import ApiContent from './ApiContent';
import InquireBalance from './trading/InquireBalance';
import Order from './trading/Order';
import OrderRvsecncl from './trading/OrderRvsecncl';
import OrderResv from './trading/OrderResv';
import OrderResvCcnl from './trading/OrderResvCcnl';
import InquireCcnl from './trading/InquireCcnl';
import InquirePresentBalance from './trading/InquirePresentBalance';
import InquireBuyableAmount from './trading/InquireBuyableAmount';
import InquireSearch from './quotations/InquireSearch';

const Log = () => {
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };

  // Stop the timer when leaving this page
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <Title
        title="Api란?"
        description="여기서 api라고 부르는건 거창하게 말한 것 일 뿐, 입력과 출력이 있는
          함수라고 보는게 더 좋을 것 같습니다. 본 화면은 자동매매를 구현하기
          앞서 작은 단위의 함수들을 하나하나 만들고 테스트 해보기 위해
          만들었습니다."
      />
      <AccordionSection title="OAuth인증">
        <ApiContent
          title="실시간 (웹소켓) 접속키 발급"
          endPoint="/oauth2/Approval"
        />
        <ApiContent title="Hashkey" endPoint="/uapi/hashkey" />
        <TokenP />
        <ApiContent title="Hashkey" endPoint="/uapi/hashkey" />
      </AccordionSection>
      <AccordionSection title="주문/계좌">
        <Order />
        <OrderRvsecncl />
        <OrderResv />
        <OrderResvCcnl />
        <ApiContent
          title="해외주식 미체결내역"
          endPoint="/trading/inquire-nccs"
        />
        <InquireBalance />
        <InquireCcnl />
        <InquirePresentBalance />
        <ApiContent
          title="해외주식 예약주문조회"
          endPoint="/trading/inquire-resv"
        />
        <InquireBuyableAmount />
        <ApiContent
          title="해외주식 미국주간주문"
          endPoint="/trading/order-weekly"
        />
        <ApiContent
          title="해외주식 미국주간정정취소"
          endPoint="/trading/order-weekly-rvsecncl"
        />
        <ApiContent
          title="해외주식 기간손익"
          endPoint="/trading/inquire-period-profit"
        />
        <ApiContent
          title="해외증거금 통화별조회"
          endPoint="/trading/inquire-margin"
        />
        <ApiContent
          title="해외주식 일별거래내역"
          endPoint="/trading/inquire-daily-trade"
        />
        <ApiContent
          title="해외주식 결제기준잔고"
          endPoint="/trading/inquire-settle-balance"
        />
      </AccordionSection>
      <AccordionSection title="[해외주식] 기본시세">
        <Price />
        <DailyPrice />
        <ApiContent
          title="해외주식 종목/지수/환율기간별시세(일/주/월/년)"
          endPoint="/quotations/inquire-daily-chartprice"
        />
        <InquireSearch />
      </AccordionSection>
      [해외주식]기본시세 해외결제일자조회 <br />
      [해외주식]기본시세 해외주식 현재가상세 <br />
      [해외주식]기본시세 해외주식분봉조회 <br />
      [해외주식]기본시세 해외지수분봉조회 <br />
      [해외주식]기본시세 해외주식 상품기본정보 <br />
      [해외주식]기본시세 해외주식 현재가 10호가
      <section className="flex bg-white border rounded-sm flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="p-4 bg-neutral-50 rounded-none">
                직접 구현한 API
              </AccordionTrigger>
              <AccordionContent className="border-t flex flex-col divide-y pb-0">
                <section className="flex items-center justify-between p-4">
                  <p>실시간 데이터 가져오기</p>
                  <Button>API 호출</Button>
                </section>
                <section className="flex items-center justify-between p-4">
                  <p>오를 종목 예측하기</p>
                  <Button>API 호출</Button>
                </section>
                <section className="flex items-center justify-between p-4">
                  <p>연속 하락한 종목 조회</p>
                  <Button>API 호출</Button>
                </section>
                <section className="flex items-center justify-between p-4">
                  <p>최고가 대비 많이 하락한 종목 조회</p>
                  <Button>API 호출</Button>
                </section>
                <section className="flex items-center justify-between p-4">
                  <p>구매해도 되는지 계산하기</p>
                  <Button>API 호출</Button>
                </section>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
};
export default Log;
