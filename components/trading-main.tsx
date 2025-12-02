import * as React from "react"
import { PurchaseHistorySection } from "@/components/sections/purchase-history-section"
import { RecommendationSection } from "@/components/sections/recommendation-section"
import { TradingListSection } from "@/components/sections/trading-list-section"

export function TradingMain() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* 구매이력 목록 섹션 */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold">구매이력 목록</h2>
                    <p className="text-sm text-muted-foreground">완료된 매매 내역을 확인할 수 있습니다</p>
                </div>
                <div className="p-4">
                    <PurchaseHistorySection />
                </div>
            </div>

            {/* 매수 목록 추천 섹션 */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold">매수 목록 추천</h2>
                    <p className="text-sm text-muted-foreground">AI 분석 기반 추천 종목</p>
                </div>
                <div className="p-4">
                    <RecommendationSection />
                </div>
            </div>

            {/* 트레이딩 목록 섹션 */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold">트레이딩 목록</h2>
                    <p className="text-sm text-muted-foreground">실시간 트레이딩 모니터링</p>
                </div>
                <div className="p-4">
                    <TradingListSection />
                </div>
            </div>
        </div>
    )
}
