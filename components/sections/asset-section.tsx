"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAccountsList } from "@/hooks/useAccountsList"
import { useKakao } from "@/hooks/useKakao"
import { tempKeyStore } from "@/store/tempKeyStore"

export function AssetSection() {
    const { selectedAccountId } = useAccountsList()
    const { data: kakaoData } = useKakao()
    const { realKey } = tempKeyStore()

    // 잔고 조회 API 호출
    const { data: balanceData, isLoading, error } = useQuery({
        queryKey: ["balance", selectedAccountId],
        enabled: !!selectedAccountId && !!kakaoData.session?.access_token && !!realKey?.access_token,
        refetchInterval: 30000, // 30초마다 자동 갱신
        queryFn: async () => {
            const response = await fetch(
                `/api/korea-invest/balance?accountId=${selectedAccountId}`,
                {
                    headers: {
                        Authorization: `Bearer ${kakaoData.session?.access_token}`,
                        "x-korea-invest-token": realKey.access_token,
                    },
                }
            )

            if (!response.ok) {
                throw new Error("잔고 조회 실패")
            }

            return response.json()
        },
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    // output3에서 자산 정보 추출
    const assetInfo = balanceData?.output3 || {}
    const totalAsset = parseFloat(assetInfo.tot_asst_amt || 0) // 총자산
    const totalPurchase = parseFloat(assetInfo.pchs_amt_smtl || 0) // 매입금액합계
    const totalProfit = parseFloat(assetInfo.evlu_pfls_amt_smtl || 0) // 평가손익합계
    const profitRate = parseFloat(assetInfo.evlu_erng_rt1 || 0) // 평가수익률

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !balanceData) {
        return (
            <div className="px-2 py-2">
                <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                        계좌 인증 후 자산 정보가 표시됩니다
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="px-2 py-2 space-y-4">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">총 자산</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalAsset)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">매입금액</p>
                    <p className="text-sm font-semibold tracking-tight">{formatCurrency(totalPurchase)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">평가손익</p>
                    <div className="flex items-center gap-1.5">
                        {totalProfit >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <p className={`text-sm font-semibold tracking-tight ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(totalProfit)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-3 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">총 수익률</p>
                <p className={`text-sm font-bold tracking-tight ${profitRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                </p>
            </div>
        </div>
    )
}
