"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { analyzeMultipleMAs, type TrendStatus } from "@/utils/trendAnalysis"
import { useKakao } from "@/hooks/useKakao"
import { accountSelectionStore } from "@/store/accountSelectionStore"
import { tempKeyStore } from "@/store/tempKeyStore"


interface SP500Stock {
    symbol: string
    name: string
    exchange: string
}

interface DailyData {
    xymd: string
    clos: string
    [key: string]: string | number | boolean | null | undefined
}

interface TrendData {
    ma20: { status: TrendStatus; slope: number }
    ma50: { status: TrendStatus; slope: number }
    ma100: { status: TrendStatus; slope: number }
    ma200: { status: TrendStatus; slope: number }
}

export function RecommendationSection() {
    const kakaoAuth = useKakao()
    const authData = kakaoAuth.data
    const selectedAccountId = accountSelectionStore((s) => s.selectedAccountId)
    const { realKey } = tempKeyStore()

    const [trendMap, setTrendMap] = React.useState<Record<string, TrendData>>({})
    const [processingSymbol, setProcessingSymbol] = React.useState<string | null>(null)
    const [initialLoadComplete, setInitialLoadComplete] = React.useState(false)

    const { data: sp500Data, isLoading: sp500Loading } = useQuery({
        queryKey: ["sp500"],
        queryFn: async () => {
            const response = await fetch("/api/sp500")
            if (!response.ok) {
                throw new Error("S&P 500 데이터 조회 실패")
            }
            return response.json() as Promise<{
                success: boolean
                count: number
                data: SP500Stock[]
            }>
        },
        staleTime: 1000 * 60 * 60,
    })

    const stocks = sp500Data?.data || []

    // 오늘 날짜의 모든 추세 데이터를 한 번에 조회
    const loadAllTrendsFromDB = async () => {
        try {
            console.log("📊 DB에서 오늘 날짜 추세 데이터 일괄 조회 시작...")
            const response = await fetch("/api/stock-trends")
            const result = await response.json()

            if (result.data && Array.isArray(result.data)) {
                const today = new Date().toISOString().split("T")[0]
                const todayTrends: Record<string, TrendData> = {}

                result.data.forEach((item: Record<string, unknown>) => {
                    if (item.updated_at === today) {
                        const symbol = String(item.symbol);
                        todayTrends[symbol] = {
                            ma20: { status: item.ma20 as TrendStatus, slope: (item.ma20_slope as number) || 0 },
                            ma50: { status: item.ma50 as TrendStatus, slope: (item.ma50_slope as number) || 0 },
                            ma100: { status: item.ma100 as TrendStatus, slope: (item.ma100_slope as number) || 0 },
                            ma200: { status: item.ma200 as TrendStatus, slope: (item.ma200_slope as number) || 0 },
                        }
                    }
                })

                console.log(`✅ DB 조회 완료: ${Object.keys(todayTrends).length}개 종목 (오늘 날짜)`)
                setTrendMap(todayTrends)
                return todayTrends
            }

            return {}
        } catch (error) {
            console.error("❌ DB 일괄 조회 실패:", error)
            return {}
        }
    }

    // 추세 계산 및 저장
    const calculateAndSaveTrend = async (stock: SP500Stock) => {
        try {
            if (!authData.user || !selectedAccountId || !realKey?.access_token) {
                return null
            }

            setProcessingSymbol(stock.symbol)

            const params = new URLSearchParams({
                accountId: selectedAccountId.toString(),
                EXCD: stock.exchange === "NASDAQ" ? "NAS" : "NYS",
                SYMB: stock.symbol,
                GUBN: "0",
                MODP: "1",
            })

            const accessToken = authData.session?.access_token
            const response = await fetch(`/api/korea-invest/daily?${params}`, {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                    "x-korea-invest-token": realKey.access_token,
                },
            })

            if (!response.ok) {
                throw new Error("일별 데이터 조회 실패")
            }

            const result = await response.json()
            const dailyData = result.output2 as DailyData[]

            if (!dailyData || dailyData.length < 205) {
                console.log(`⚠️ ${stock.symbol}: 데이터 부족 (${dailyData?.length || 0}개)`)
                return null
            }

            const candleData = dailyData.map((item) => ({
                clos: item.clos,
                xymd: item.xymd,
            }))

            const trendResult = analyzeMultipleMAs(candleData)
            console.log(`✅ ${stock.symbol} 추세 분석 완료:`, trendResult)

            // DB에 저장
            const saveResponse = await fetch("/api/stock-trends", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    symbol: stock.symbol,
                    ma20: trendResult.ma20.status,
                    ma50: trendResult.ma50.status,
                    ma100: trendResult.ma100.status,
                    ma200: trendResult.ma200.status,
                    ma20_slope: trendResult.ma20.slope,
                    ma50_slope: trendResult.ma50.slope,
                    ma100_slope: trendResult.ma100.slope,
                    ma200_slope: trendResult.ma200.slope,
                }),
            })

            if (!saveResponse.ok) {
                console.error(`❌ ${stock.symbol} 저장 실패`)
            }

            return trendResult
        } catch (error) {
            console.error(`❌ ${stock.symbol} 처리 실패:`, error)
            return null
        } finally {
            setProcessingSymbol(null)
        }
    }

    // 초기 로드: DB에서 오늘 날짜 데이터 일괄 조회
    React.useEffect(() => {
        if (stocks.length === 0 || initialLoadComplete) {
            return
        }

        const initializeData = async () => {
            await loadAllTrendsFromDB()
            setInitialLoadComplete(true)
        }

        initializeData()
    }, [stocks.length])

    // 누락된 종목 순차 처리
    React.useEffect(() => {
        if (!authData.user || !selectedAccountId || !realKey?.access_token ||
            stocks.length === 0 || !initialLoadComplete) {
            return
        }

        let cancelled = false

        const processMissingStocks = async () => {
            const missingStocks = stocks.filter(stock => !trendMap[stock.symbol])

            if (missingStocks.length > 0) {
                console.log(`🔄 누락된 종목 처리 시작: ${missingStocks.length}개`)
            }

            for (const stock of missingStocks) {
                if (cancelled) break

                const trendResult = await calculateAndSaveTrend(stock)
                if (trendResult) {
                    setTrendMap(prev => ({
                        ...prev,
                        [stock.symbol]: trendResult
                    }))
                }

                await new Promise(resolve => setTimeout(resolve, 500))
            }

            if (missingStocks.length > 0) {
                console.log(`✅ 모든 종목 처리 완료`)
            }
        }

        processMissingStocks()

        return () => {
            cancelled = true
        }
    }, [authData.user, selectedAccountId, realKey?.access_token, stocks, initialLoadComplete, trendMap, calculateAndSaveTrend])

    const getTrendIcon = (status: TrendStatus) => {
        switch (status) {
            case "상승전환":
            case "상승":
                return <TrendingUp className="h-3 w-3 text-green-500" />
            case "하락전환":
            case "하락":
                return <TrendingDown className="h-3 w-3 text-red-500" />
            default:
                return <Minus className="h-3 w-3 text-gray-400" />
        }
    }

    const getTrendColor = (status: TrendStatus) => {
        switch (status) {
            case "상승전환":
            case "상승":
                return "text-green-600 bg-green-50 border-green-200"
            case "하락전환":
            case "하락":
                return "text-red-600 bg-red-50 border-red-200"
            default:
                return "text-gray-600 bg-gray-50 border-gray-200"
        }
    }

    const handleAddToTrading = (stock: SP500Stock) => {
        console.log("Add to trading:", stock)
    }

    if (sp500Loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        S&P 500 종목 로딩 중...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <ScrollArea className="h-[600px]">
                {stocks.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="text-center">
                            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                종목 데이터가 없습니다
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 p-1">
                        {stocks.map((stock) => {
                            const stockTrend = trendMap[stock.symbol]
                            const isProcessing = processingSymbol === stock.symbol

                            return (
                                <Card key={stock.symbol} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-base font-bold">
                                                    {stock.symbol}
                                                </CardTitle>
                                                <CardDescription className="text-xs truncate" title={stock.name}>
                                                    {stock.name}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant={stock.exchange === "NASDAQ" ? "default" : "secondary"}
                                                className="ml-2 shrink-0"
                                            >
                                                {stock.exchange}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-2">
                                        {stockTrend ? (
                                            <div className="grid grid-cols-2 gap-1 mb-2">
                                                <div className={`flex flex-col gap-0.5 px-2 py-1 rounded text-xs border ${getTrendColor(stockTrend.ma20.status)}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getTrendIcon(stockTrend.ma20.status)}
                                                        <span className="font-medium">20일</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-70">{(stockTrend.ma20.slope * 100).toFixed(4)}%</span>
                                                </div>
                                                <div className={`flex flex-col gap-0.5 px-2 py-1 rounded text-xs border ${getTrendColor(stockTrend.ma50.status)}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getTrendIcon(stockTrend.ma50.status)}
                                                        <span className="font-medium">50일</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-70">{(stockTrend.ma50.slope * 100).toFixed(4)}%</span>
                                                </div>
                                                <div className={`flex flex-col gap-0.5 px-2 py-1 rounded text-xs border ${getTrendColor(stockTrend.ma100.status)}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getTrendIcon(stockTrend.ma100.status)}
                                                        <span className="font-medium">100일</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-70">{(stockTrend.ma100.slope * 100).toFixed(4)}%</span>
                                                </div>
                                                <div className={`flex flex-col gap-0.5 px-2 py-1 rounded text-xs border ${getTrendColor(stockTrend.ma200.status)}`}>
                                                    <div className="flex items-center gap-1">
                                                        {getTrendIcon(stockTrend.ma200.status)}
                                                        <span className="font-medium">200일</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-70">{(stockTrend.ma200.slope * 100).toFixed(4)}%</span>
                                                </div>
                                            </div>
                                        ) : isProcessing ? (
                                            <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                분석 중...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                                                분석 대기
                                            </div>
                                        )}

                                        <Button
                                            className="w-full"
                                            size="sm"
                                            onClick={() => handleAddToTrading(stock)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            트레이딩 추가
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
