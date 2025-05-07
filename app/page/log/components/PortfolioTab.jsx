import TabPanel from "./TabPanel";

const PortfolioTab = ({
  data,
  isLoading,
  selectedStock,
  setSelectedStock,
  onRefresh,
  fetchStockDetail,
  detailLoading,
  체결데이터, // 체결 데이터를 props로 받음
}) => {
  return (
    <TabPanel
      value="구매"
      data={data}
      isLoading={isLoading}
      onRefresh={onRefresh}
      title="보유 종목"
      description="현재 보유 중인 종목 목록입니다. 아이콘 색상은 수익률을 나타냅니다."
      loadingMessage="보유 종목 정보를 불러오는 중입니다..."
      emptyMessage="보유 중인 종목이 없습니다."
      selectedStock={selectedStock}
      setSelectedStock={setSelectedStock}
      fetchStockDetail={fetchStockDetail}
      detailLoading={detailLoading}
      체결데이터={체결데이터} // 체결 데이터 전달
    />
  );
};

export default PortfolioTab;
