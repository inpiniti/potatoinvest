"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // 추가: 결제중 배지
import { Loader2 } from "lucide-react"; // 추가: 로딩 아이콘

import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";

import { logos } from "@/json/logoData";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sell from "./Sell";
import useTrading from "@/hooks/useTrading";

const Buy = () => {
  const api = useApi();
  const { 미체결내역 } = useTrading();

  const [cano, acntPrdtCd] = useAccount();
  const [list, setList] = useState([]);
  const [미체결리스트, set미체결리스트] = useState([]);
  const [loading, setLoading] = useState(true); // 추가: 로딩 상태

  /**
   * 보유 종목 목록을 조회하는 함수
   * @returns {Promise<void>}
   */
  const getList = useCallback(async () => {
    try {
      setLoading(true); // 로딩 시작
      if (cano && acntPrdtCd) {
        const payload = {
          CANO: cano,
          ACNT_PRDT_CD: acntPrdtCd,
          OVRS_EXCG_CD: "NASD",
          TR_CRCY_CD: "USD",
          CTX_AREA_FK200: "",
          CTX_AREA_NK200: "",
        };

        const response = await api.trading.inquireBalance(payload);
        const data = await response.json();

        setList(data.output1 || []);
      }
    } catch (error) {
      console.error("보유종목 조회 실패:", error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, []);

  /**
   * 미체결 내역을 조회하는 함수
   * @returns {Promise<void>}
   */
  const 미체결내역조회 = async () => {
    try {
      const data = await 미체결내역();
      set미체결리스트(data.output || []);
    } catch (error) {
      console.error("미체결 내역 조회 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    getList();
    미체결내역조회();
  }, []);

  // 미체결 내역을 포함한 종목 목록
  const 미체결list = useMemo(() => {
    const pdno = 미체결리스트?.map((미체결) => 미체결.pdno) || [];
    return list.map((item) => {
      if (pdno.includes(item.ovrs_pdno)) {
        return {
          ...item,
          결제중: true,
        };
      } else {
        return {
          ...item,
          결제중: false,
        };
      }
    });
  }, [미체결리스트, list]);

  /**
   * 수익률에 따른 색상 반환
   * @param {Object} item - 종목 데이터
   * @returns {string} 적용할 CSS 클래스
   */
  const color = useCallback((item) =>
    item.evlu_pfls_rt > 0 ? "text-red-400" : "text-blue-400"
  );

  /**
   * 매도 완료 후 호출되는 함수
   * 미체결 내역을 재조회합니다
   */
  const handleSellComplete = useCallback(() => {
    //setTimeout(() => {
    미체결내역조회(); // 약간의 지연 후 미체결 내역 재조회
    //getList(); // 보유 종목 목록도 갱신
    //}, 1000); // 서버 반영 시간을 고려해 1초 대기
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {loading ? (
        // 로딩 중일 때 표시할 UI
        <div className="col-span-full flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            <p className="text-gray-500">보유 종목을 불러오는 중입니다...</p>
          </div>
        </div>
      ) : 미체결list?.length > 0 ? (
        // 종목 목록 표시
        미체결list.map((item) => {
          const logo = logos.find((logo) => logo.name === item.ovrs_pdno) || {};
          return (
            <Card
              key={item.STK_CD || item.ovrs_pdno}
              className="flex flex-row px-6 py-4 gap-2 items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Avatar className="border w-12 h-12">
                  <AvatarImage
                    src={`https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`}
                    alt="@radix-vue"
                    className="w-12 h-12"
                  />
                  <AvatarFallback>{item.ovrs_pdno?.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="font-bold text-2xl">{item.ovrs_pdno}</div>
                  <div className="text-neutral-400">{item.ovrs_item_name}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-end">
                  <div className="text-xs text-neutral-400">
                    매입평균가격 {Number(item.pchs_avg_pric).toFixed(2)} x{" "}
                    {item.ovrs_cblc_qty}
                  </div>
                  <div className={`text-2xl font-bold ${color(item)}`}>
                    {Number(item.now_pric2).toFixed(2)}{" "}
                    <span className="text-sm">
                      ({Number(item.evlu_pfls_rt).toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
              {/* 결제중 배지 개선 */}
              <div>
                {item.결제중 && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    결제중
                  </Badge>
                )}
              </div>
              <Sell
                ovrs_pdno={item.ovrs_pdno}
                ovrs_item_name={item.ovrs_item_name}
                pchs_avg_pric={Number(item.pchs_avg_pric).toFixed(2)}
                ovrs_cblc_qty={item.ovrs_cblc_qty}
                evlu_pfls_rt={item.evlu_pfls_rt}
                onSellComplete={handleSellComplete} // 추가: 매도 완료 콜백
              />
            </Card>
          );
        })
      ) : (
        // 데이터가 없을 때 표시할 UI
        <div className="col-span-full flex justify-center items-center py-12">
          <p className="text-gray-500">보유 종목이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default Buy;
