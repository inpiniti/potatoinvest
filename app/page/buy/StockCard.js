"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // 추가: 결제중 배지
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { BarChart2 } from "lucide-react";

import Sell from "./Sell";
import BuyMore from "./BuyMore";

import { logos } from "@/json/logoData";
import { Button } from "@/components/ui/button";

import PredictionProgress from "./PredictionProgress"; // AI 예측 컴포넌트
import StockChart from "./StockChart"; // 종목 차트 컴포넌트
import { useState } from "react";

// 추출된 StockCard 컴포넌트
const StockCard = ({ item, onSellComplete, predictions }) => {
  const [showChart, setShowChart] = useState(false);
  const logo = logos.find((logo) => logo.name === item.ovrs_pdno) || {};
  const colorClass = item.evlu_pfls_rt > 0 ? "text-red-400" : "text-blue-400";

  // 해당 종목의 예측값 찾기
  const prediction = predictions?.find((pred) => pred.name === item.ovrs_pdno);
  const predictionValue = prediction?.예측결과;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* 카드 헤더 */}
      <div className="shrink-0 p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Avatar className="border w-10 h-10">
            <AvatarImage
              src={`https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`}
              alt={item.ovrs_item_name || "로고"}
            />
            <AvatarFallback>{item.ovrs_pdno?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-lg flex items-center gap-2">
              {item.ovrs_pdno}
              {item.결제중 && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                >
                  결제중
                </Badge>
              )}
            </div>
            <div className="text-sm text-neutral-500">
              {item.ovrs_item_name}
            </div>
          </div>
        </div>
        {/* 차트 버튼 추가 */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => setShowChart(!showChart)}
        >
          <BarChart2
            className={`h-5 w-5 ${
              showChart ? "text-blue-500" : "text-gray-500"
            }`}
          />
        </Button>
      </div>

      {/* 카드 바디 - 차트 모드와 정보 모드 전환 */}
      {showChart ? (
        <div className="p-4">
          <StockChart ticker={item.ovrs_pdno} />
        </div>
      ) : (
        <div className="grow-0 h-full p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1">
              매입평균가격
            </div>
            <div className="font-medium">
              ${Number(item.pchs_avg_pric).toFixed(2)} × {item.ovrs_cblc_qty} 주
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-neutral-500 mb-1">
              현재가격
            </div>
            <div className={`font-bold ${colorClass}`}>
              ${Number(item.now_pric2).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1">
              매입금액
            </div>
            <div className="font-medium">
              $
              {(
                Number(item.pchs_avg_pric) * Number(item.ovrs_cblc_qty)
              ).toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-neutral-500 mb-1">
              평가손익
            </div>
            <div className={`font-bold ${colorClass}`}>
              {Number(item.evlu_pfls_rt).toFixed(2)}%
            </div>
          </div>

          {/* AI 예측 정보 - 전체 너비로 추가 */}
          <div className="col-span-2 mt-2">
            <PredictionProgress value={predictionValue} />
          </div>
        </div>
      )}

      {/* 카드 푸터 */}
      <div className="shrink-0 p-4 border-t bg-gray-50 flex justify-end gap-2">
        <Sell
          ovrs_pdno={item.ovrs_pdno}
          ovrs_item_name={item.ovrs_item_name}
          pchs_avg_pric={Number(item.pchs_avg_pric).toFixed(2)}
          ovrs_cblc_qty={item.ovrs_cblc_qty}
          evlu_pfls_rt={item.evlu_pfls_rt}
          onSellComplete={onSellComplete}
        />
        <BuyMore
          ovrs_pdno={item.ovrs_pdno}
          ovrs_item_name={item.ovrs_item_name}
          pchs_avg_pric={Number(item.pchs_avg_pric).toFixed(2)}
          ovrs_cblc_qty={item.ovrs_cblc_qty}
          evlu_pfls_rt={item.evlu_pfls_rt}
          onSellComplete={onSellComplete}
        />
      </div>
    </Card>
  );
};

export default StockCard;
