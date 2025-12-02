"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useAccountsList } from "@/hooks/useAccountsList"
import { useKakao } from "@/hooks/useKakao"
import { tempKeyStore } from "@/store/tempKeyStore"
import { toast } from "sonner"
import dayjs from "dayjs"

export function AccountSection() {
    const {
        data: accounts,
        selectedAccountId,
        selectAccount
    } = useAccountsList()

    const { data: kakaoData } = useKakao()
    const { setRealKey, realKey } = tempKeyStore()
    const [isLoading, setIsLoading] = React.useState(false)

    // 토큰 유효성 확인
    const isTokenValid = React.useMemo(() => {
        if (!realKey?.access_token) return false
        const expiredTime = realKey?.access_token_token_expired
        if (!expiredTime) return false
        return dayjs(expiredTime).isAfter(dayjs())
    }, [realKey])

    const handleAuthenticate = async () => {
        if (!selectedAccountId) {
            toast.error("계좌를 선택해주세요")
            return
        }

        if (!kakaoData.session?.access_token) {
            toast.error("로그인이 필요합니다")
            return
        }

        setIsLoading(true)
        try {
            // /api/korea-invest/token 호출
            const response = await fetch("/api/korea-invest/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${kakaoData.session.access_token}`,
                },
                body: JSON.stringify({
                    accountId: selectedAccountId,
                }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || "토큰 발급 실패")
            }

            const data = await response.json()

            // tempKeyStore에 토큰 저장
            setRealKey({
                ...realKey,
                access_token: data.access_token,
                access_token_token_expired: dayjs()
                    .add(data.expires_in, "second")
                    .format("YYYY-MM-DD HH:mm:ss"),
                token_type: data.token_type,
            })

            toast.success("계좌 인증이 완료되었습니다")
        } catch (error) {
            console.error("토큰 발급 실패:", error)
            toast.error(error instanceof Error ? error.message : "토큰 발급 실패")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="px-2 py-2 space-y-2">
            <Select
                value={selectedAccountId ? String(selectedAccountId) : ""}
                onValueChange={(val) => selectAccount(Number(val))}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="계좌 선택" />
                </SelectTrigger>
                <SelectContent>
                    {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                            {account.alias || account.account_number} ({account.account_number})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedAccountId && (
                <Button
                    variant={isTokenValid ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={handleAuthenticate}
                    disabled={isTokenValid || isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            인증 중...
                        </>
                    ) : isTokenValid ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            인증 완료
                        </>
                    ) : (
                        "계좌 인증"
                    )}
                </Button>
            )}
        </div>
    )
}
