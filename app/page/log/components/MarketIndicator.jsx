import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Wallet,
  DollarSign,
  BarChart4,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

const MarketIndicatorCard = ({ children, isShow = true, loading = false }) => {
  if (!isShow) return null;

  return (
    <Card className="p-3 my-3">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 시장 지표 로딩 중...
        </div>
      ) : (
        <div className="flex flex-col space-y-3">{children}</div>
      )}
    </Card>
  );
};

const MarketIndicatorItem = ({ region, type, value, change }) => {
  // 변화율 부호에 따른 색상 설정
  const changeNum = parseFloat(change);
  const isUndefined = change === undefined || change === null || change === "";
  const isPositive = !isUndefined && changeNum > 0;
  const isZero = !isUndefined && changeNum === 0;

  // 색상 결정
  const valueColorClass = isUndefined
    ? ""
    : isPositive
    ? "text-red-500"
    : isZero
    ? "text-gray-500"
    : "text-blue-500";

  // 퍼센트 기호 추가 및 부호 처리
  const formattedChange = isUndefined
    ? ""
    : isPositive
    ? `+${change}%`
    : `${change}%`;

  // 아이콘 선택
  let IconComponent;
  let colorClass = "text-gray-600";

  switch (region) {
    case "미국국채":
      IconComponent = DollarSign;
      colorClass = "text-green-600";
      break;
    case "지갑아이콘":
      IconComponent = Wallet;
      colorClass = "text-blue-600";
      break;
    case "돈 아이콘":
      IconComponent = DollarSign;
      colorClass = "text-amber-600";
      break;
    case "차트아이콘":
      IconComponent = BarChart4;
      colorClass = "text-purple-600";
      break;
    default:
      IconComponent = TrendingUp;
      colorClass = "text-gray-600";
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* 왼쪽 아이콘 - 원형 배경 */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <div className={`${colorClass}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* 텍스트 내용 */}
        <div>
          <div className="font-bold flex items-baseline gap-1">
            <span>{value}</span>
            <span className={cn("text-sm", valueColorClass)}>
              {formattedChange}
            </span>
          </div>
          <div className="text-sm text-gray-500">{type}</div>
        </div>
      </div>

      {/* 오른쪽 */}
      <div className="text-gray-400 text-sm">차트그림</div>
    </div>
  );
};

export { MarketIndicatorCard, MarketIndicatorItem };
