import { useCallback, useState } from "react";
import { toast } from "sonner";

const useToggle = () => {
  const [autoBuy, setAutoBuy] = useState(false); // 자동 매수 활성화 여부
  const [autoSell, setAutoSell] = useState(false); // 자동 매도 활성화 여부 추가
  const [autoPlay, setAutoPlay] = useState(false);
  const [showMarket, setShowMarket] = useState(true); // 시장 지표 표시 여부 추가

  // 자동 순환 토글 함수
  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
    toast.info(
      autoPlay
        ? "자동 순환이 비활성화되었습니다"
        : "자동 순환이 활성화되었습니다"
    );
  }, []);

  // 자동 매수 토글 함수
  const toggleAutoBuy = () => {
    const newState = !autoBuy;
    setAutoBuy(newState);
    toast.info(
      newState
        ? "자동 매수가 활성화되었습니다"
        : "자동 매수가 비활성화되었습니다"
    );
  };

  // 자동 매도 토글 함수
  const toggleAutoSell = () => {
    const newState = !autoSell;
    setAutoSell(newState);
    toast.info(
      newState
        ? "자동 매도가 활성화되었습니다"
        : "자동 매도가 비활성화되었습니다"
    );
  };

  // 시장 지표 표시 토글 함수 추가
  const toggleMarket = () => {
    setShowMarket((prev) => !prev);
  };

  return {
    autoBuy,
    autoSell,
    autoPlay,
    showMarket,

    toggleAutoPlay,
    toggleAutoBuy,
    toggleAutoSell,
    toggleMarket, // 시장 지표 표시 토글 함수 반환
  };
};

export default useToggle;
