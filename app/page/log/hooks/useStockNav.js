import { useState, useCallback } from "react";

const useStockNav = ({
  activeTab,
  setActiveTab,
  필터링된분석데이터,
  체결데이터,
  구매데이터,
  onStockChange, // 새로 추가: 종목 변경 시 호출될 콜백 함수
  refreshAnalysisData, // 분석 데이터 새로고침 함수 추가
}) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // 선택된 종목 변경 시 콜백 호출하는 래퍼 함수
  const handleSelectStock = useCallback(
    (stockCode) => {
      setSelectedStock(stockCode);
      // 종목이 변경될 때 상세 정보 가져오기
      if (stockCode && onStockChange) {
        onStockChange(stockCode);
      }
    },
    [onStockChange]
  );

  // 탭 순서 정의
  const tabOrder = ["분석", "구매"];

  // 다음 탭 가져오기
  const getNextTab = (currentTab) => {
    const currentIndex = tabOrder.indexOf(currentTab);
    return tabOrder[(currentIndex + 1) % tabOrder.length];
  };

  // 이전 탭 가져오기
  const getPrevTab = (currentTab) => {
    const currentIndex = tabOrder.indexOf(currentTab);
    return tabOrder[(currentIndex - 1 + tabOrder.length) % tabOrder.length];
  };

  // 탭별 데이터 가져오기
  const getDataForTab = (tab) => {
    if (tab === "분석") return 필터링된분석데이터;
    if (tab === "체결") return 체결데이터;
    if (tab === "구매") return 구매데이터;
    return [];
  };

  // 분석 데이터 새로고침 후 첫 번째 아이콘 선택 함수
  const loadAnalysisAndSelectFirst = useCallback(async () => {
    // 로딩 상태 설정
    setIsLoadingAnalysis(true);

    try {
      // 먼저 분석 탭으로 이동
      setActiveTab("분석");

      // 분석 데이터 새로고침 (비동기)
      if (refreshAnalysisData) {
        await refreshAnalysisData();
      }

      // 새로고침 후 데이터에서 첫 번째 항목 선택
      if (필터링된분석데이터 && 필터링된분석데이터.length > 0) {
        const firstStock =
          필터링된분석데이터[0]?.name ||
          필터링된분석데이터[0]?.code ||
          필터링된분석데이터[0]?.ovrs_pdno ||
          필터링된분석데이터[0]?.pdno;

        if (firstStock) {
          handleSelectStock(firstStock);
        }
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [
    필터링된분석데이터,
    setActiveTab,
    refreshAnalysisData,
    handleSelectStock,
  ]);

  const moveToNextStock = useCallback(async () => {
    // 현재 활성화된 탭의 데이터
    let currentData = getDataForTab(activeTab);

    // 현재 탭에 데이터가 없으면 다음 탭으로 이동
    if (currentData.length === 0) {
      const nextTab = getNextTab(activeTab);

      // 구매 탭에서 분석 탭으로 이동하는 경우 특별 처리
      if (activeTab === "구매" && nextTab === "분석") {
        await loadAnalysisAndSelectFirst();
        return;
      }

      setActiveTab(nextTab);
      currentData = getDataForTab(nextTab);

      // 다음 탭에도 데이터가 없으면 그 다음 탭으로
      if (currentData.length === 0) {
        const nextNextTab = getNextTab(nextTab);

        // 분석 탭으로 이동하는 경우 특별 처리
        if (nextNextTab === "분석") {
          await loadAnalysisAndSelectFirst();
          return;
        }

        setActiveTab(nextNextTab);
        currentData = getDataForTab(nextNextTab);

        // 모든 탭에 데이터가 없으면 종료
        if (currentData.length === 0) return;
      }

      // 다음 탭의 첫 번째 항목 선택
      const firstStock =
        currentData[0]?.name ||
        currentData[0]?.code ||
        currentData[0]?.ovrs_pdno ||
        currentData[0]?.pdno;
      if (firstStock) handleSelectStock(firstStock); // 래퍼 함수 사용
      return;
    }

    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      const firstStock =
        currentData[0]?.name ||
        currentData[0]?.code ||
        currentData[0]?.ovrs_pdno ||
        currentData[0]?.pdno;
      if (firstStock) handleSelectStock(firstStock); // 래퍼 함수 사용
      return;
    }

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex(
      (item) =>
        (item.name || item.code || item.ovrs_pdno || item.pdno) ===
        selectedStock
    );

    // 현재 탭의 마지막 항목인 경우 다음 탭으로 이동
    if (currentIndex === currentData.length - 1) {
      const nextTab = getNextTab(activeTab);

      // 구매 탭에서 분석 탭으로 이동하는 경우 특별 처리
      if (activeTab === "구매" && nextTab === "분석") {
        await loadAnalysisAndSelectFirst();
        return;
      }

      setActiveTab(nextTab);

      // 다음 탭의 데이터
      const nextTabData = getDataForTab(nextTab);

      // 다음 탭에 데이터가 없으면 그 다음 탭으로
      if (nextTabData.length === 0) {
        const nextNextTab = getNextTab(nextTab);

        // 분석 탭으로 이동하는 경우 특별 처리
        if (nextNextTab === "분석") {
          await loadAnalysisAndSelectFirst();
          return;
        }

        setActiveTab(nextNextTab);
        const nextNextTabData = getDataForTab(nextNextTab);

        // 다음 다음 탭에도 데이터가 없으면 원래 탭 유지
        if (nextNextTabData.length === 0) {
          return;
        }

        // 다음 다음 탭의 첫 번째 항목 선택
        const firstStock =
          nextNextTabData[0]?.name ||
          nextNextTabData[0]?.code ||
          nextNextTabData[0]?.ovrs_pdno ||
          nextNextTabData[0]?.pdno;
        if (firstStock) handleSelectStock(firstStock); // 래퍼 함수 사용
      } else {
        // 다음 탭의 첫 번째 항목 선택
        const firstStock =
          nextTabData[0]?.name ||
          nextTabData[0]?.code ||
          nextTabData[0]?.ovrs_pdno ||
          nextTabData[0]?.pdno;
        if (firstStock) handleSelectStock(firstStock); // 래퍼 함수 사용
      }
      return;
    }

    // 다음 인덱스 계산 (탭 내에서의 이동)
    const nextIndex = currentIndex + 1;

    // 다음 종목 선택
    const nextStock =
      currentData[nextIndex]?.name ||
      currentData[nextIndex]?.code ||
      currentData[nextIndex]?.ovrs_pdno ||
      currentData[nextIndex]?.pdno;

    if (nextStock) handleSelectStock(nextStock); // 래퍼 함수 사용
  }, [
    selectedStock,
    activeTab,
    필터링된분석데이터,
    체결데이터,
    구매데이터,
    getDataForTab,
    getNextTab,
    setActiveTab,
    handleSelectStock,
  ]);

  const moveToPrevStock = useCallback(() => {
    // 현재 활성화된 탭의 데이터
    let currentData = getDataForTab(activeTab);

    // 현재 탭에 데이터가 없으면 이전 탭으로 이동
    if (currentData.length === 0) {
      const prevTab = getPrevTab(activeTab);
      setActiveTab(prevTab);
      currentData = getDataForTab(prevTab);

      // 이전 탭에도 데이터가 없으면 그 이전 탭으로
      if (currentData.length === 0) {
        const prevPrevTab = getPrevTab(prevTab);
        setActiveTab(prevPrevTab);
        currentData = getDataForTab(prevPrevTab);

        // 모든 탭에 데이터가 없으면 종료
        if (currentData.length === 0) return;
      }

      // 이전 탭의 마지막 항목 선택
      const lastStock =
        currentData[currentData.length - 1]?.name ||
        currentData[currentData.length - 1]?.code ||
        currentData[currentData.length - 1]?.ovrs_pdno ||
        currentData[currentData.length - 1]?.pdno;
      if (lastStock) handleSelectStock(lastStock); // 래퍼 함수 사용
      return;
    }

    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      const firstStock =
        currentData[0]?.name ||
        currentData[0]?.code ||
        currentData[0]?.ovrs_pdno ||
        currentData[0]?.pdno;
      if (firstStock) handleSelectStock(firstStock); // 래퍼 함수 사용
      return;
    }

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex(
      (item) =>
        (item.name || item.code || item.ovrs_pdno || item.pdno) ===
        selectedStock
    );

    // 현재 탭의 첫 번째 항목인 경우 이전 탭으로 이동
    if (currentIndex === 0) {
      const prevTab = getPrevTab(activeTab);
      setActiveTab(prevTab);

      // 이전 탭의 데이터
      const prevTabData = getDataForTab(prevTab);

      // 이전 탭에 데이터가 없으면 그 이전 탭으로
      if (prevTabData.length === 0) {
        const prevPrevTab = getPrevTab(prevTab);
        setActiveTab(prevPrevTab);
        const prevPrevTabData = getDataForTab(prevPrevTab);

        // 이전 이전 탭에도 데이터가 없으면 원래 탭 유지
        if (prevPrevTabData.length === 0) {
          return;
        }

        // 이전 이전 탭의 마지막 항목 선택
        const lastStock =
          prevPrevTabData[prevPrevTabData.length - 1]?.name ||
          prevPrevTabData[prevPrevTabData.length - 1]?.code ||
          prevPrevTabData[prevPrevTabData.length - 1]?.ovrs_pdno ||
          prevPrevTabData[prevPrevTabData.length - 1]?.pdno;
        if (lastStock) handleSelectStock(lastStock); // 래퍼 함수 사용
      } else {
        // 이전 탭의 마지막 항목 선택
        const lastStock =
          prevTabData[prevTabData.length - 1]?.name ||
          prevTabData[prevTabData.length - 1]?.code ||
          prevTabData[prevTabData.length - 1]?.ovrs_pdno ||
          prevTabData[prevTabData.length - 1]?.pdno;
        if (lastStock) handleSelectStock(lastStock); // 래퍼 함수 사용
      }
      return;
    }

    // 이전 인덱스 계산 (탭 내에서의 이동)
    const prevIndex = currentIndex - 1;

    // 이전 종목 선택
    const prevStock =
      currentData[prevIndex]?.name ||
      currentData[prevIndex]?.code ||
      currentData[prevIndex]?.ovrs_pdno ||
      currentData[prevIndex]?.pdno;

    if (prevStock) handleSelectStock(prevStock); // 래퍼 함수 사용
  }, [
    selectedStock,
    activeTab,
    필터링된분석데이터,
    체결데이터,
    구매데이터,
    getDataForTab,
    getPrevTab,
    setActiveTab,
    handleSelectStock,
  ]);

  return {
    selectedStock,
    setSelectedStock: handleSelectStock, // 래퍼 함수로 교체
    moveToNextStock,
    moveToPrevStock,
    isLoadingAnalysis, // 분석 데이터 로딩 상태 노출
  };
};

export default useStockNav;
