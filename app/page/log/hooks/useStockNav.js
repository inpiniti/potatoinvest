import { useState, useCallback } from "react";

const useStockNav = ({
  activeTab,
  setActiveTab,
  필터링된분석데이터,
  체결데이터,
  구매데이터,
  onStockChange,
  refreshAnalysisData,
}) => {
  // selectedStock을 객체로 관리
  const [selectedStock, setSelectedStock] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // 탭별 데이터 가져오기 함수
  const getDataForTab = useCallback(
    (tab) => {
      if (tab === "분석") return 필터링된분석데이터;
      if (tab === "체결") return 체결데이터;
      if (tab === "구매") return 구매데이터;
      return [];
    },
    [필터링된분석데이터, 체결데이터, 구매데이터]
  );

  // 종목 코드로 객체 찾기
  const findStockByCode = useCallback(
    (code, tab) => {
      const data = getDataForTab(tab);
      return data.find(
        (item) =>
          item.name === code ||
          item.code === code ||
          item.ovrs_pdno === code ||
          item.pdno === code
      );
    },
    [getDataForTab]
  );

  // 선택된 종목 변경 시 콜백 호출하는 래퍼 함수
  const handleSelectStock = useCallback(
    (stockInput) => {
      let stockObject = null;

      if (typeof stockInput === "string") {
        // 문자열(코드)이 전달된 경우 객체 찾기
        stockObject = findStockByCode(stockInput, activeTab);
      } else if (stockInput && typeof stockInput === "object") {
        // 이미 객체인 경우 그대로 사용
        stockObject = stockInput;
      }

      // 유효한 객체를 찾지 못한 경우
      if (!stockObject) {
        console.warn("유효한 종목을 찾을 수 없습니다:", stockInput);
        return;
      }

      console.log("선택된 종목:", stockObject);

      // 상태 업데이트
      setSelectedStock(stockObject);

      // 콜백 호출
      if (onStockChange) {
        const stockCode =
          stockObject.name ||
          stockObject.code ||
          stockObject.ovrs_pdno ||
          stockObject.pdno;

        onStockChange(stockCode, stockObject);
      }
    },
    [activeTab, findStockByCode, onStockChange]
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

  // 분석 데이터 새로고침 후 첫 번째 아이콘 선택 함수 (수정 필요 없음)
  const loadAnalysisAndSelectFirst = useCallback(async () => {
    setIsLoadingAnalysis(true);

    try {
      setActiveTab("분석");

      if (refreshAnalysisData) {
        await refreshAnalysisData();
      }

      if (필터링된분석데이터 && 필터링된분석데이터.length > 0) {
        const firstStock = 필터링된분석데이터[0];
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

  // 현재 선택된 종목의 코드 추출 함수
  const getSelectedStockCode = useCallback(() => {
    if (!selectedStock) return null;

    return (
      selectedStock.name ||
      selectedStock.code ||
      selectedStock.ovrs_pdno ||
      selectedStock.pdno
    );
  }, [selectedStock]);

  // moveToNextStock 함수 - 객체 기반으로 수정
  const moveToNextStock = useCallback(async () => {
    let currentData = getDataForTab(activeTab);

    if (currentData.length === 0) {
      // 데이터가 없는 경우 다음 탭으로 이동
      const nextTab = getNextTab(activeTab);

      if (activeTab === "구매" && nextTab === "분석") {
        await loadAnalysisAndSelectFirst();
        return;
      }

      setActiveTab(nextTab);
      currentData = getDataForTab(nextTab);

      // 다음 탭에도 데이터가 없으면 그 다음 탭으로
      if (currentData.length === 0) {
        const nextNextTab = getNextTab(nextTab);

        if (nextNextTab === "분석") {
          await loadAnalysisAndSelectFirst();
          return;
        }

        setActiveTab(nextNextTab);
        currentData = getDataForTab(nextNextTab);

        if (currentData.length === 0) return;
      }

      // 다음 탭의 첫 번째 항목 선택
      if (currentData[0]) handleSelectStock(currentData[0]);
      return;
    }

    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      if (currentData[0]) handleSelectStock(currentData[0]);
      return;
    }

    // 현재 선택된 종목 코드 추출
    const selectedCode = getSelectedStockCode();

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex((item) => {
      const itemCode = item.name || item.code || item.ovrs_pdno || item.pdno;

      return itemCode === selectedCode;
    });

    // 현재 종목을 찾지 못했거나 마지막 종목인 경우 다음 탭으로 이동
    if (currentIndex === -1 || currentIndex === currentData.length - 1) {
      const nextTab = getNextTab(activeTab);

      if (activeTab === "구매" && nextTab === "분석") {
        await loadAnalysisAndSelectFirst();
        return;
      }

      setActiveTab(nextTab);
      const nextTabData = getDataForTab(nextTab);

      if (nextTabData.length === 0) {
        const nextNextTab = getNextTab(nextTab);

        if (nextNextTab === "분석") {
          await loadAnalysisAndSelectFirst();
          return;
        }

        setActiveTab(nextNextTab);
        const nextNextTabData = getDataForTab(nextNextTab);

        if (nextNextTabData.length === 0) return;

        if (nextNextTabData[0]) handleSelectStock(nextNextTabData[0]);
      } else {
        if (nextTabData[0]) handleSelectStock(nextTabData[0]);
      }
      return;
    }

    // 다음 인덱스 계산 (탭 내에서의 이동)
    const nextIndex = currentIndex + 1;

    // 다음 종목 선택
    if (currentData[nextIndex]) handleSelectStock(currentData[nextIndex]);
  }, [
    activeTab,
    getDataForTab,
    getNextTab,
    getSelectedStockCode,
    handleSelectStock,
    loadAnalysisAndSelectFirst,
    selectedStock,
    setActiveTab,
  ]);

  // moveToPrevStock 함수도 유사하게 수정
  const moveToPrevStock = useCallback(() => {
    let currentData = getDataForTab(activeTab);

    if (currentData.length === 0) {
      // 데이터가 없는 경우 이전 탭으로 이동
      const prevTab = getPrevTab(activeTab);
      setActiveTab(prevTab);
      currentData = getDataForTab(prevTab);

      // 이전 탭에도 데이터가 없으면 그 이전 탭으로
      if (currentData.length === 0) {
        const prevPrevTab = getPrevTab(prevTab);
        setActiveTab(prevPrevTab);
        currentData = getDataForTab(prevPrevTab);

        if (currentData.length === 0) return;
      }

      // 이전 탭의 마지막 항목 선택
      const lastItem = currentData[currentData.length - 1];
      if (lastItem) handleSelectStock(lastItem);
      return;
    }

    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      if (currentData[0]) handleSelectStock(currentData[0]);
      return;
    }

    // 현재 선택된 종목 코드 추출
    const selectedCode = getSelectedStockCode();

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex((item) => {
      const itemCode = item.name || item.code || item.ovrs_pdno || item.pdno;

      return itemCode === selectedCode;
    });

    // 현재 종목을 찾지 못했거나 첫 번째 종목인 경우 이전 탭으로 이동
    if (currentIndex === -1 || currentIndex === 0) {
      const prevTab = getPrevTab(activeTab);
      setActiveTab(prevTab);
      const prevTabData = getDataForTab(prevTab);

      if (prevTabData.length === 0) {
        const prevPrevTab = getPrevTab(prevTab);
        setActiveTab(prevPrevTab);
        const prevPrevTabData = getDataForTab(prevPrevTab);

        if (prevPrevTabData.length === 0) return;

        // 이전 이전 탭의 마지막 항목 선택
        const lastItem = prevPrevTabData[prevPrevTabData.length - 1];
        if (lastItem) handleSelectStock(lastItem);
      } else {
        // 이전 탭의 마지막 항목 선택
        const lastItem = prevTabData[prevTabData.length - 1];
        if (lastItem) handleSelectStock(lastItem);
      }
      return;
    }

    // 이전 인덱스 계산 (탭 내에서의 이동)
    const prevIndex = currentIndex - 1;

    // 이전 종목 선택
    if (currentData[prevIndex]) handleSelectStock(currentData[prevIndex]);
  }, [
    activeTab,
    getDataForTab,
    getPrevTab,
    getSelectedStockCode,
    handleSelectStock,
    selectedStock,
    setActiveTab,
  ]);

  return {
    selectedStock,
    setSelectedStock: handleSelectStock,
    moveToNextStock,
    moveToPrevStock,
    isLoadingAnalysis,
  };
};

export default useStockNav;
