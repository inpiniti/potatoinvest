"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAccountsList from "@/hooks/useAccountsList";
import useAccountAuth from "@/hooks/useAccountAuth";

/**
 * 만료 시간을 밀리초 타임스탬프로 변환
 * - 숫자면 그대로 사용 (epoch ms)
 * - 문자열이면 파싱 (YYYY-MM-DD HH:mm:ss 형식)
 */
function parseExpiryToMs(expiry) {
  if (!expiry) return null;

  // 이미 숫자(밀리초)면 그대로 반환
  if (typeof expiry === "number") return expiry;

  // 문자열이면 Date 파싱
  if (typeof expiry === "string") {
    // "2024-01-01 23:59:59" 형식 처리
    const parsed = new Date(expiry.replace(" ", "T"));
    const ms = parsed.getTime();
    return isNaN(ms) ? null : ms;
  }

  return null;
}

/**
 * 남은 시간(ms)을 사람이 읽을 수 있는 형식으로 변환
 */
function msToHuman(ms) {
  if (ms == null || ms <= 0) return "만료됨";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainMin = minutes % 60;
    return remainMin > 0 ? `${hours}h ${remainMin}m` : `${hours}h`;
  }

  if (minutes > 0) {
    const remainSec = seconds % 60;
    return remainSec > 0 ? `${minutes}m ${remainSec}s` : `${minutes}m`;
  }

  if (seconds > 0) {
    return `${seconds}s`;
  }

  return "만료 임박 (<1s)";
}

/**
 * 남은 시간에 따른 색상 클래스 반환
 */
function getTimeColor(ms) {
  if (ms == null || ms <= 0) return "text-destructive"; // 만료: 빨강
  if (ms < 10000) return "text-red-600 dark:text-red-400"; // <10s: 빨강
  if (ms < 60000) return "text-yellow-600 dark:text-yellow-400"; // <60s: 노랑
  return "text-emerald-600 dark:text-emerald-400"; // 유효: 초록
}

export default function AccountAuthStatus() {
  const { selectedAccountId, selectedAccount } = useAccountsList();
  const { data, authenticate, authenticating, refresh } =
    useAccountAuth(selectedAccountId);

  // 1초 간격으로 틱 업데이트
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    if (!selectedAccountId || !data) return;
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [selectedAccountId, data]);

  // 만료 시간을 밀리초로 변환 (문자열/숫자 모두 처리)
  const expiryMs = data
    ? parseExpiryToMs(data.access_token_token_expired)
    : null;

  // 남은 시간 계산
  const remainingMs = expiryMs ? Math.max(0, expiryMs - tick) : null;
  const expired = remainingMs == null || remainingMs <= 0;
  const remainingLabel = remainingMs == null ? "-" : msToHuman(remainingMs);
  const timeColor = getTimeColor(remainingMs);

  // 디버깅용 로그 (개발 중에만)
  useEffect(() => {
    if (data?.access_token_token_expired) {
      console.log("[AccountAuth Debug]", {
        raw: data.access_token_token_expired,
        type: typeof data.access_token_token_expired,
        parsed: expiryMs,
        parsedDate: expiryMs ? new Date(expiryMs).toLocaleString() : null,
        now: tick,
        remaining: remainingMs,
        remainingLabel,
      });
    }
  }, [
    data?.access_token_token_expired,
    expiryMs,
    tick,
    remainingMs,
    remainingLabel,
  ]);

  // 만료 시 자동 refetch
  useEffect(() => {
    if (selectedAccountId && expired && data && !authenticating) {
      refresh();
    }
  }, [selectedAccountId, expired, data, authenticating, refresh]);

  return (
    <Card className="h-64 flex flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-base truncate">
          {selectedAccount?.alias ||
            (selectedAccountId
              ? `계좌 #${selectedAccountId}`
              : "선택된 계좌 없음")}
        </CardTitle>
        <CardDescription>
          {selectedAccountId ? "계좌 인증 상태" : "좌측에서 계좌를 선택하세요"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 text-sm">
        {selectedAccountId ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">상태</span>
              <span
                className={
                  expired
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {expired ? "만료됨" : "유효"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">남은 시간</span>
              <span className={timeColor}>{remainingLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">만료 시각</span>
              <span className="truncate max-w-[140px] text-xs">
                {data && expiryMs
                  ? new Date(expiryMs).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "-"}
              </span>
            </div>
            <div className="mt-auto flex gap-2">
              <Button
                size="sm"
                variant={expired ? "default" : "outline"}
                disabled={authenticating || !selectedAccountId}
                onClick={() => authenticate(selectedAccountId)}
                className="flex-1"
              >
                {authenticating
                  ? "인증 중..."
                  : expired
                  ? "계좌 인증"
                  : "재인증"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => refresh()}
                disabled={!data}
              >
                새로고침
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            계좌를 선택하면 인증 상태가 표시됩니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
