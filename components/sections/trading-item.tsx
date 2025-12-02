"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface TradingStock {
    id: string
    symbol: string
    name: string
    exchange: string
}

interface TradingItemProps {
    stock: TradingStock
    onRemove: () => void
}

interface MovingAverage {
    ma20: number
    ma50: number
    ma100: number
    ma200: number
    slope20: number
    slope50: number
    slope100: number
    slope200: number
}

type TradeSignal = "매수" | "매도" | "대기"

export function TradingItem({ stock, onRemove }: TradingItemProps) {
    const [currentPrice, setCurrentPrice] = React.useState<number>(0)
    const [movingAverages, setMovingAverages] = React.useState<MovingAverage | null>(null)
    const [tradeSignal, setTradeSignal] = React.useState<TradeSignal>("대기")
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        // TODO: 1분봉 데이터 조회 및 이평선 계산
        // TODO: 실시간 현재가 조회
        // TODO: 매매신호 감지

        const fetchData = async () => {
            setIsLoading(true)
            // 임시 데이터
            setTimeout(() => {
                setCurrentPrice(150.25)
                setMovingAverages({
                    ma20: 149.50,
                    ma50: 148.75,
                    ma100: 147.25,
                    ma200: 145.50,
                    slope20: 0.05,
                    slope50: 0.03,
                    slope100: 0.01,
                    slope200: -0.01,
                })
                setIsLoading(false)
            }, 1000)
        }

        fetchData()

        // 1분마다 업데이트
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [stock])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value)
    }

    const getSlopeColor = (slope: number) => {
        if (slope > 0) return 'text-green-500'
        if (slope < 0) return 'text-red-500'
        return 'text-muted-foreground'
    }

    const getSlopeIcon = (slope: number) => {
        if (slope > 0) return <TrendingUp className="h-3 w-3" />
        if (slope < 0) return <TrendingDown className="h-3 w-3" />
        return <Activity className="h-3 w-3" />
    }

    const getSignalBadge = (signal: TradeSignal) => {
        const variants = {
            "매수": "default" as const,
            "매도": "destructive" as const,
            "대기": "secondary" as const,
        }
        return <Badge variant={variants[signal]}>{signal}</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getSignalBadge(tradeSignal)}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* 현재가 */}
                        <div>
                            <p className="text-sm text-muted-foreground">현재가</p>
                            <p className="text-2xl font-bold">{formatCurrency(currentPrice)}</p>
                        </div>

                        {/* 이평선 정보 */}
                        {movingAverages && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">MA20</p>
                                        <div className={`flex items-center gap-1 ${getSlopeColor(movingAverages.slope20)}`}>
                                            {getSlopeIcon(movingAverages.slope20)}
                                            <span className="text-xs">{movingAverages.slope20.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm font-semibold">{formatCurrency(movingAverages.ma20)}</p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">MA50</p>
                                        <div className={`flex items-center gap-1 ${getSlopeColor(movingAverages.slope50)}`}>
                                            {getSlopeIcon(movingAverages.slope50)}
                                            <span className="text-xs">{movingAverages.slope50.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm font-semibold">{formatCurrency(movingAverages.ma50)}</p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">MA100</p>
                                        <div className={`flex items-center gap-1 ${getSlopeColor(movingAverages.slope100)}`}>
                                            {getSlopeIcon(movingAverages.slope100)}
                                            <span className="text-xs">{movingAverages.slope100.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm font-semibold">{formatCurrency(movingAverages.ma100)}</p>
                                </div>

                                <div className="rounded-lg bg-muted p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">MA200</p>
                                        <div className={`flex items-center gap-1 ${getSlopeColor(movingAverages.slope200)}`}>
                                            {getSlopeIcon(movingAverages.slope200)}
                                            <span className="text-xs">{movingAverages.slope200.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm font-semibold">{formatCurrency(movingAverages.ma200)}</p>
                                </div>
                            </div>
                        )}

                        {/* 매매 로직 설명 */}
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">
                                • 기울기가 음수→0 전환: 매수신호<br />
                                • 기울기가 양수→0 전환: 매도신호<br />
                                • 수량: 1, 2, 4, 8, 16, 32, 64... 순차 증가
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
