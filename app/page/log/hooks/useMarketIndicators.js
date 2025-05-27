import { useState, useEffect } from "react";
import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";

const useMarketIndicators = () => {
  const [indicators, setIndicators] = useState([
    {
      region: "미국국채",
      type: "나스닥 선물",
      value: "0",
      change: "0",
    },
    {
      region: "미국국채",
      type: "나스닥 종합",
      value: "0",
      change: "0",
    },
    {
      region: "미국국채",
      type: "S&P500",
      value: "0",
      change: "0",
    },
    {
      region: "지갑아이콘",
      type: "평가손익",
      value: "0원",
      change: "0",
    },
    {
      region: "돈 아이콘",
      type: "외화가능액",
      value: "0원",
      change: "0",
    },
  ]);

  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 모든 지표 데이터 새로고침
  const refreshAllIndicators = async () => {
    if (!CANO || !ACNT_PRDT_CD) return;

    setLoading(true);
    try {
      // 두 API 응답 데이터를 먼저 가져옴
      const [marketData, balanceData] = await Promise.all([
        fetch("/api/yahoo")
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),

        api.trading
          .inquirePresentBalance({
            CANO,
            ACNT_PRDT_CD,
            WCRC_FRCR_DVSN_CD: "01",
            NATN_CD: "000",
            TR_MKET_CD: "00",
            INQR_DVSN_CD: "00",
          })
          .then((res) => res.json())
          .catch(() => ({})),
      ]);

      // 기존 지표 데이터 복사
      const updatedIndicators = [...indicators];

      // 1. 시장 지수 데이터 업데이트
      if (marketData && marketData.length) {
        marketData.forEach((item) => {
          const index = updatedIndicators.findIndex(
            (indicator) =>
              indicator.type === item.type ||
              (indicator.type === "S&P500" && item.type === "S&P 500")
          );

          if (index !== -1) {
            updatedIndicators[index] = {
              ...updatedIndicators[index],
              value: item.value,
              change: item.change,
            };
          }
        });
      }

      // 2. 계좌 잔고 데이터 업데이트
      if (balanceData && balanceData.output3 && balanceData.output3) {
        const balanceInfo = balanceData.output3;

        // 원화 포맷팅 함수
        const formatKRW = (value) => {
          const num = parseFloat(value || 0);
          return `${num.toLocaleString()}원`;
        };

        // 변화율 가져오기
        const evluErngRt = parseFloat(balanceInfo.evlu_erng_rt1 || 0).toFixed(
          2
        );

        // 평가손익 업데이트
        const evalProfitIndex = updatedIndicators.findIndex(
          (item) => item.type === "평가손익"
        );
        if (evalProfitIndex !== -1) {
          updatedIndicators[evalProfitIndex] = {
            ...updatedIndicators[evalProfitIndex],
            value: formatKRW(balanceInfo.evlu_pfls_amt_smtl),
            change: evluErngRt,
          };
        }

        // 외화가능액 업데이트
        const availableAmountIndex = updatedIndicators.findIndex(
          (item) => item.type === "외화가능액"
        );
        if (availableAmountIndex !== -1) {
          updatedIndicators[availableAmountIndex] = {
            ...updatedIndicators[availableAmountIndex],
            value: formatKRW(balanceInfo.frcr_evlu_tota),
            change: "0",
          };
        }
      }

      // 통합된 상태 업데이트 1회만 수행
      setIndicators(updatedIndicators);
    } catch (err) {
      console.error("지표 데이터 새로고침 실패:", err);
      setError(err.message || "데이터를 가져오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    // 초기 로드
    refreshAllIndicators();

    // 30초마다 갱신
    const intervalId = setInterval(() => {
      refreshAllIndicators();
    }, 30000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [CANO, ACNT_PRDT_CD]);

  return {
    indicators,
    loading,
    error,
    refreshIndicators: refreshAllIndicators,
  };
};

export default useMarketIndicators;
