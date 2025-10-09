"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import useAssets from "@/hooks/useAssets";

export default function AssetInfoSection() {
  const { assetInfo, isLoading, isFetching, error, refetch } = useAssets();

  console.log("assetInfo", assetInfo);

  // 숫자 포맷팅 함수
  const formatNumber = (value) => {
    if (!value) return "-";
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  // 손익률 색상 결정
  const getProfitColor = (value) => {
    if (!value) return "";
    const num = Number(value);
    if (isNaN(num) || num === 0) return "";
    return num > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">자산 정보</CardTitle>
            <CardDescription className="text-xs mt-1">
              계좌 자산 요약
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-8 w-8"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="text-sm text-muted-foreground">불러오는 중...</div>
        )}

        {error && (
          <div className="text-sm text-destructive">
            {error instanceof Error ? error.message : "오류가 발생했습니다"}
          </div>
        )}

        {!isLoading && !error && !assetInfo && (
          <div className="text-sm text-muted-foreground">
            자산 정보가 없습니다. 계좌를 선택하고 인증해주세요.
          </div>
        )}

        {!isLoading && !error && assetInfo && (
          <div className="grid grid-cols-2 gap-3">
            {/* 총자산 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">총자산</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.tot_asst_amt)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 총예수금 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">총예수금</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.tot_dncl_amt)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 평가금액합계 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">평가금액</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.evlu_amt_smtl_amt)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 평가손익금액합계 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">평가손익</div>
              <div
                className={`text-base font-semibold ${getProfitColor(
                  assetInfo.tot_evlu_pfls_amt
                )}`}
              >
                {formatNumber(assetInfo.tot_evlu_pfls_amt)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 평가수익률 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">평가수익률</div>
              <div
                className={`text-base font-semibold ${getProfitColor(
                  assetInfo.evlu_erng_rt1
                )}`}
              >
                {assetInfo.evlu_erng_rt1
                  ? `${Number(assetInfo.evlu_erng_rt1).toFixed(2)}%`
                  : "-"}
              </div>
            </div>

            {/* 출금가능금액 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">출금가능</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.wdrw_psbl_tot_amt)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 외화평가총액 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">외화평가총액</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.frcr_evlu_tota)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>

            {/* 미결제매수금액합계 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">미결제매수</div>
              <div className="text-base font-semibold">
                {formatNumber(assetInfo.ustl_buy_amt_smtl)}
                <span className="text-xs text-muted-foreground ml-1">원</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
