"use client";

import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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
      <section className="bg-white border rounded-sm p-4 flex flex-col justify-between gap-2">
        <h1 className="text-xl font-bold">Api란?</h1>
        <p className="text-muted-foreground">
          여기서 api라고 부르는건 거창하게 말한 것 일 뿐, 입력과 출력이 있는
          함수라고 보는게 더 좋을 것 같습니다. 본 화면은 자동매매를 구현하기
          앞서 작은 단위의 함수들을 하나하나 만들고 테스트 해보기 위해
          만들었습니다.
        </p>
      </section>

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
