"use client"

import * as React from "react"
import { TradingItem } from "@/components/sections/trading-item"

interface TradingStock {
    id: string
    symbol: string
    name: string
    exchange: string
}

export function TradingListSection() {
    const [tradingStocks, setTradingStocks] = React.useState<TradingStock[]>([])

    const handleRemove = (id: string) => {
        setTradingStocks(prev => prev.filter(stock => stock.id !== id))
    }

    return (
        <div className="space-y-4">
            {tradingStocks.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                        트레이딩 종목을 추가해주세요
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tradingStocks.map((stock) => (
                        <TradingItem
                            key={stock.id}
                            stock={stock}
                            onRemove={() => handleRemove(stock.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
