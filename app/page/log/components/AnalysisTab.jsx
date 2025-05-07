import TabPanel from "./TabPanel";

const AnalysisTab = ({
  data,
  isLoading,
  selectedStock,
  setSelectedStock,
  onRefresh,
  fetchStockDetail,
  detailLoading,
}) => {
  return (
    <TabPanel
      value="분석"
      data={data}
      isLoading={isLoading}
      onRefresh={onRefresh}
      title="분석 데이터"
      description="AI가 분석한 상승 확률이 높은 종목들입니다. 예측 점수가 60% 이상인 종목만 표시됩니다."
      loadingMessage="분석 데이터를 불러오는 중입니다..."
      emptyMessage="분석 데이터가 없습니다."
      selectedStock={selectedStock}
      setSelectedStock={setSelectedStock}
      fetchStockDetail={fetchStockDetail}
      detailLoading={detailLoading}
    />
  );
};

export default AnalysisTab;
