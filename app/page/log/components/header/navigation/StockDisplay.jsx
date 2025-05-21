const StockDisplay = ({ selectedStockObject, activeTab }) => {
  // 종목명 추출 함수
  const getStockDisplayName = () => {
    if (!selectedStockObject) return null;

    return (
      selectedStockObject.name ||
      selectedStockObject.code ||
      selectedStockObject.ovrs_pdno ||
      selectedStockObject.pdno ||
      ""
    );
  };

  // 현재 종목 표시용 - 객체 또는 코드 사용
  const currentStockDisplay = getStockDisplayName();

  return (
    <>
      {currentStockDisplay ? (
        <div className="font-medium flex items-center gap-2">
          {currentStockDisplay}

          {/* 보유종목인 경우 변동율 표시 */}
          {activeTab === "구매" && selectedStockObject?.evlu_pfls_rt && (
            <span
              className={`text-sm ${
                parseFloat(selectedStockObject.evlu_pfls_rt) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ({selectedStockObject.evlu_pfls_rt})
            </span>
          )}
        </div>
      ) : (
        <div className="font-medium">미선택</div>
      )}
    </>
  );
};

export default StockDisplay;
