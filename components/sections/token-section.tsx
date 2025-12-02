"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { tempKeyStore } from "@/store/tempKeyStore"
import { keyStore } from "@/store/keyStore"
import dayjs from "dayjs"

export function TokenSection() {
    const { key: { isVts } } = keyStore()
    const { key, realKey } = tempKeyStore()

    // 현재 활성화된 토큰 정보 가져오기
    const activeKey = isVts ? key : realKey
    const accessToken = activeKey?.access_token
    const expiredTime = activeKey?.access_token_token_expired

    // 만료 시간 계산
    const getRemainingTime = () => {
        if (!expiredTime) return null
        const now = dayjs()
        const expiry = dayjs(expiredTime)
        const diffMinutes = expiry.diff(now, 'minute')

        if (diffMinutes < 0) return "만료됨"
        const hours = Math.floor(diffMinutes / 60)
        const minutes = diffMinutes % 60
        return `${hours}시간 ${minutes}분`
    }

    return (
        <div className="px-2 py-2">
            {accessToken ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {isVts ? "모의투자" : "실전투자"}
                        </span>
                        <Badge variant="default" className="text-xs">활성</Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                        <ScrollArea className="h-16">
                            <p className="text-xs font-mono break-all">{accessToken}</p>
                        </ScrollArea>
                    </div>
                    {expiredTime && (
                        <p className="text-xs text-muted-foreground text-right">
                            만료: {getRemainingTime()}
                        </p>
                    )}
                </div>
            ) : (
                <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                        계좌 인증 후 토큰이 표시됩니다
                    </p>
                </div>
            )}
        </div>
    )
}
