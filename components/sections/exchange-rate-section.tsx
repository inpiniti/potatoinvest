"use client"

import * as React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExchangeRateSection() {
    const [exchangeRate, setExchangeRate] = React.useState<number>(1350.50)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleRefresh = async () => {
        setIsLoading(true)
        // TODO: 실제 환율 API 호출
        setTimeout(() => {
            setExchangeRate(1350.50 + Math.random() * 10 - 5)
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="px-2 py-2 space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">USD/KRW</p>
                    <p className="text-lg font-bold">₩{exchangeRate.toFixed(2)}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">최근 업데이트</p>
                <p className="text-xs">{new Date().toLocaleString('ko-KR')}</p>
            </div>
        </div>
    )
}
