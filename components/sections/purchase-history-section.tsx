"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useAccountsList } from "@/hooks/useAccountsList"
import { useKakao } from "@/hooks/useKakao"
import { tempKeyStore } from "@/store/tempKeyStore"

export function PurchaseHistorySection() {
    const { selectedAccountId } = useAccountsList()
    const { data: kakaoData } = useKakao()
    const { realKey } = tempKeyStore()

    // 잔고 조회 API 호출
    const { data: balanceData, isLoading } = useQuery({
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    // output1에서 보유 종목 정보 추출
    const holdings = balanceData?.output1 || []

    if (isLoading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <ScrollArea className="h-[400px]">
            {holdings.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">보유 종목이 없습니다</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">종목코드</TableHead>
                            <TableHead className="min-w-[120px]">종목명</TableHead>
                            <TableHead className="text-right w-[80px]">보유수량</TableHead>
                            <TableHead className="text-right w-[100px]">매입평균가</TableHead>
                            <TableHead className="text-right w-[100px]">현재가</TableHead>
                            <TableHead className="text-right w-[100px]">평가손익</TableHead>
                            <TableHead className="text-right w-[80px]">수익률</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {holdings.map((holding: any, index: number) => {
                            const quantity = parseFloat(holding.ord_psbl_qty || 0) // 보유수량
                            const avgPrice = parseFloat(holding.pchs_avg_pric || 0) // 매입평균가
                            const currentPrice = parseFloat(holding.now_pric2 || 0) // 현재가
                            const profit = parseFloat(holding.evlu_pfls_amt || 0) // 평가손익
                            const profitRate = parseFloat(holding.evlu_pfls_rt || 0) // 수익률

                            return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{holding.ovrs_pdno}</TableCell>
                                    <TableCell className="truncate max-w-[150px]" title={holding.ovrs_item_name}>
                                        {holding.ovrs_item_name}
                                    </TableCell>
                                    <TableCell className="text-right">{quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(avgPrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(currentPrice)}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {formatCurrency(profit)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={profitRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )}
        </ScrollArea>
    )
}
