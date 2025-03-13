"use client";

import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Title } from "@/components/title";

import { Button } from "@/components/ui/button";
import TokenP from "./TokenP";
import Price from "./Price";
import DailyPrice from "./DailyPrice";

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
      <section className="bg-white border rounded-sm overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="p-4 bg-neutral-50 rounded-none">
              OAuth인증
            </AccordionTrigger>
            <AccordionContent className="border-t flex flex-col divide-y pb-0">
              <section className="flex items-center justify-between p-4 text-neutral-300">
                <div className="flex gap-4">
                  <b>실시간 (웹소켓) 접속키 발급[실시간-000]</b>
                  <p>/oauth2/Approval</p>
                </div>
                <Button disabled>API 호출</Button>
              </section>
              <section className="flex items-center justify-between p-4 text-neutral-300">
                <div className="flex gap-4">
                  <b>Hashkey</b>
                  <p>/uapi/hashkey</p>
                </div>
                <Button disabled>API 호출</Button>
              </section>
              <TokenP />
              <section className="flex items-center justify-between p-4 text-neutral-300">
                <div className="flex gap-4">
                  <b>Hashkey</b>
                  <p>/uapi/hashkey</p>
                </div>
                <Button disabled>API 호출</Button>
              </section>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section className="bg-white border rounded-sm overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="p-4 bg-neutral-50 rounded-none">
              [해외주식] 기본시세
            </AccordionTrigger>
            <AccordionContent className="border-t flex flex-col divide-y pb-0">
              <Price />
              <DailyPrice />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      주문/계좌 <br />
      해외주식 주문 /uapi/overseas-stock/v1/trading/order
      <br />
      해외주식 정정취소주문 /uapi/overseas-stock/v1/trading/order-rvsecncl
      <br />
      해외주식 예약주문접수 /uapi/overseas-stock/v1/trading/order-resv
      <br />
      해외주식 예약주문접수취소 /uapi/overseas-stock/v1/trading/order-resv-ccnl
      <br />
      해외주식 미체결내역 /uapi/overseas-stock/v1/trading/inquire-nccs
      <br />
      해외주식 잔고 /uapi/overseas-stock/v1/trading/inquire-balance
      <br />
      해외주식 주문체결내역 /uapi/overseas-stock/v1/trading/inquire-ccnl
      <br />
      해외주식 체결기준현재잔고
      /uapi/overseas-stock/v1/trading/inquire-present-balance
      <br />
      해외주식 예약주문조회
      <br />
      해외주식 매수가능금액조회
      <br />
      해외주식 미국주간주문
      <br />
      해외주식 미국주간정정취소
      <br />
      해외주식 기간손익
      <br />
      해외증거금 통화별조회
      <br />
      해외주식 일별거래내역
      <br />
      해외주식 결제기준잔고
      <br />
      기본시세 해외주식 현재체결가 /uapi/overseas-price/v1/quotations/price
      <br />
      해외주식 기간별시세 /uapi/overseas-price/v1/quotations/dailyprice
      <br />
      해외주식 종목/지수/환율기간별시세(일/주/월/년)
      /uapi/overseas-price/v1/quotations/inquire-daily-chartprice
      <br />
      해외주식 조건검색 /uapi/overseas-price/v1/quotations/inquire-search
      <br />
      [해외주식]기본시세 해외결제일자조회 <br />
      [해외주식]기본시세 해외주식 현재가상세 <br />
      [해외주식]기본시세 해외주식분봉조회 <br />
      [해외주식]기본시세 해외지수분봉조회 <br />
      [해외주식]기본시세 해외주식 상품기본정보 <br />
      [해외주식]기본시세 해외주식 현재가 10호가
      <br />
      <section className="bg-white border rounded-sm overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="p-4 bg-neutral-50 rounded-none">
              한국투자 증권 API
            </AccordionTrigger>
            <AccordionContent className="border-t flex flex-col divide-y pb-0">
              <section className="flex items-center justify-between p-4">
                <div className="flex gap-4">
                  <b>구매하기</b>
                  <p>/api/koreainvestment/buy</p>
                </div>
                <Button>API 호출</Button>
              </section>
              <section className="flex items-center justify-between p-4">
                <div className="flex gap-4">
                  <b>판매하기</b>
                  <p>/api/koreainvestment/sell</p>
                </div>
                <Button>API 호출</Button>
              </section>
              <section className="flex items-center justify-between p-4">
                <p>보유금액 가져오기</p>
                <Button>API 호출</Button>
              </section>
              <section className="flex items-center justify-between p-4">
                <p>구매한 데이터(종목) 가져오기</p>
                <Button>API 호출</Button>
              </section>
              <section className="flex items-center justify-between p-4">
                <p>실시간 종목 정보 가져오기</p>
                <Button>API 호출</Button>
              </section>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
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
