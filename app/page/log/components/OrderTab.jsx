import TabPanel from "./TabPanel";

const OrderTab = ({
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
      value="체결"
      data={data}
      isLoading={isLoading}
      onRefresh={onRefresh}
      title="미체결 내역"
      description="현재 처리 중인 주문 내역입니다."
      loadingMessage="미체결 내역을 불러오는 중입니다..."
      emptyMessage="현재 미체결 내역이 없습니다."
      selectedStock={selectedStock}
      setSelectedStock={setSelectedStock}
      fetchStockDetail={fetchStockDetail}
      detailLoading={detailLoading}
    />
  );
};

export default OrderTab;
