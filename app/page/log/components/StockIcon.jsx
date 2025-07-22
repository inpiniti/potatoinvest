import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLogoUrl } from "../utils/logoUtils";
import { Badge } from "@/components/ui/badge";

const IconWrap = ({ isShow, children }) => {
  if (!isShow) return null;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 place-items-center relative gap-y-2">
      {children}
    </div>
  );
};

const StockIcon = ({ item, selectedStock, onSelect, loading, 체결데이터 }) => {
  const logoUrl = getLogoUrl(item);
  const displayName = (item.name || item.code || "N/A").substring(0, 6);
  // 선택 여부 검사 - 객체 비교로 변경
  const isSelected = (() => {
    if (!selectedStock) return false;

    // item의 코드 추출
    const itemCode = item.name || item.code || item.ovrs_pdno || item.pdno;

    if (typeof selectedStock === "object") {
      // selectedStock이 객체인 경우
      const selectedCode =
        selectedStock.name ||
        selectedStock.code ||
        selectedStock.ovrs_pdno ||
        selectedStock.pdno;
      return itemCode === selectedCode;
    } else {
      // selectedStock이 문자열인 경우 (이전 버전 호환성)
      return itemCode === selectedStock;
    }
  })();
  const isLoading = loading && isSelected;

  // 예측 결과(확률) 계산
  const predictionValue =
    item.예측결과 !== undefined
      ? `${(item.예측결과 * 100)?.toFixed(0)}%`
      : "N/A";

  // 데이터 타입에 따라 다른 정보 표시
  let additionalInfo = null;

  if (item.type === "분석" && item.perf_1_m !== undefined) {
    // 분석 데이터: 한달 성과(하락률) 계산
    const monthlyPerf = item.perf_1_m?.toFixed(1);
    additionalInfo = (
      <span
        className={`text-[10px] ${
          parseFloat(monthlyPerf) >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        ({monthlyPerf > 0 ? "+" : ""}
        {monthlyPerf}%)
      </span>
    );
  } else if (item.type === "구매" && item.evlu_pfls_rt !== undefined) {
    // 보유 종목: 구매 후 변동량(수익률) 표시
    const changeValue = Number(item.evlu_pfls_rt)?.toFixed(1);
    additionalInfo = (
      <span
        className={`text-[10px] ${
          parseFloat(changeValue) >= 0 ? "text-green-600" : "text-red-600"
        } font-semibold`}
      >
        ({changeValue > 0 ? "+" : ""}
        {changeValue}%)
      </span>
    );
  }

  // 미체결 내역에 있는지 확인하여 체결 중 상태 판단
  // 보유 종목 탭에서만 체결 중 표시
  const isPendingOrder =
    체결데이터 &&
    체결데이터.some((order) => {
      // 종목 코드 추출
      const itemCode = item.name || item.code || item.ovrs_pdno || item.pdno;
      const orderCode = order.name || order.pdno;

      // 정확히 동일한 종목코드인 경우만 체결 중으로 간주
      return itemCode === orderCode;
    });

  const handleClick = () => {
    onSelect(item);
  };

  return (
    <div
      className="flex flex-col items-center w-20 gap-1"
      onClick={handleClick}
    >
      <div
        className={`relative rounded-2xl overflow-hidden flex items-center justify-center
          ${
            isSelected
              ? "ring-2 ring-red-500 ring-offset-2 bg-white shadow-lg transform scale-105 transition-all"
              : "bg-gray-50 filter grayscale-[50%] opacity-90 transition-all hover:grayscale-0 hover:opacity-100"
          }`}
      >
        <Avatar className="w-14 h-14 rounded-2xl">
          <AvatarImage
            src={logoUrl}
            alt={displayName}
            className={`object-contain ${
              isSelected
                ? isLoading
                  ? "brightness-90 filter grayscale-[70%]"
                  : "brightness-110"
                : "brightness-90"
            }`}
          />
          <AvatarFallback
            className={`text-md font-bold rounded-2xl ${
              isSelected
                ? "bg-white text-gray-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {displayName.substring(0, 1)}
          </AvatarFallback>
        </Avatar>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* 체결 중 표시 배지 - 보유 종목 탭에서만 표시 */}
        {isPendingOrder && (
          <Badge className="absolute bottom-0 right-0 text-[8px] bg-red-400 text-white rounded px-1 py-0.5">
            체결중
          </Badge>
        )}
      </div>

      <div
        className={`text-center ${isSelected ? "font-medium" : "font-normal"}`}
      >
        {/* 종목코드 표시 */}
        <p
          className={`text-xs truncate w-full text-center ${
            isSelected ? "font-semibold text-black" : "text-gray-600"
          }`}
        >
          {displayName}
        </p>

        {/* 확률과 하락률 함께 표시 */}
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {/* 예측 확률 */}
          <span
            className={`text-xs ${
              isSelected
                ? parseInt(predictionValue) >= 60
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
                : parseInt(predictionValue) >= 60
                ? "text-green-500"
                : "text-red-400"
            }`}
          >
            {predictionValue}
          </span>

          {/* 추가 정보 (한달 성과 또는 변동량) */}
          {additionalInfo}
        </div>
      </div>
    </div>
  );
};

export default StockIcon;
export { IconWrap };
