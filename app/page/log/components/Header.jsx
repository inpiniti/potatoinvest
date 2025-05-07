import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Play,
  Pause,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Header = ({
  selectedStock,
  movePrevStock,
  moveNextStock,
  refreshAll,
  isLoading,
  activeTab,
  필터링된분석데이터,
  체결데이터,
  구매데이터,
  onRefreshDetail,
}) => {
  // 자동 순환 상태 관리
  const [autoPlay, setAutoPlay] = useState(false);
  const [interval, setInterval] = useState(3000); // 기본 3초
  const autoPlayTimerRef = useRef(null);

  // 현재 탭에 데이터가 있는지 확인
  const hasData =
    (activeTab === "분석" && 필터링된분석데이터.length > 0) ||
    (activeTab === "체결" && 체결데이터.length > 0) ||
    (activeTab === "구매" && 구매데이터.length > 0);

  // 자동 순환 토글 함수
  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  // 자동 순환 효과
  useEffect(() => {
    // 자동 순환 중이고, 데이터가 있는 경우
    if (autoPlay && hasData && !isLoading) {
      // 타이머 설정
      autoPlayTimerRef.current = setTimeout(() => {
        moveNextStock();
      }, interval);
    }

    // 클린업 함수
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, hasData, isLoading, moveNextStock, selectedStock, interval]);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={movePrevStock}
          disabled={!hasData || isLoading || autoPlay}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {selectedStock ? (
          <div className="font-medium flex items-center gap-2">
            {selectedStock}
          </div>
        ) : (
          <div className="font-medium text-xl">데이터 로그</div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={moveNextStock}
          disabled={!hasData || isLoading || autoPlay}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* 자동 순환 컨트롤 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 mr-2">
                <Switch
                  id="auto-play"
                  checked={autoPlay}
                  onCheckedChange={toggleAutoPlay}
                  disabled={!hasData || isLoading}
                />
                <Label htmlFor="auto-play" className="text-xs">
                  auto
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>3초마다 자동으로 다음 종목으로 이동합니다</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          새로고침
        </Button>
      </div>
    </div>
  );
};

export default Header;
