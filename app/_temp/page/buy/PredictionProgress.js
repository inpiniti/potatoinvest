// 예측 진행률을 시각적으로 표현하는 Progress 컴포넌트
const PredictionProgress = ({ value }) => {
  // 값이 없으면 "-" 표시
  if (value === undefined || value === null) {
    return <div className="text-neutral-400">예측 정보 없음</div>;
  }

  // 퍼센트로 변환 (0~1 값을 0~100%로)
  const percent = Math.round(value * 100);

  // 색상 결정: 높을수록 빨간색(상승), 낮을수록 파란색(하락)
  const getColor = () => {
    if (percent >= 80) return "bg-red-500";
    if (percent >= 65) return "bg-orange-500";
    if (percent >= 50) return "bg-yellow-500";
    if (percent >= 35) return "bg-blue-300";
    return "bg-blue-500";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs">
        <span className="font-medium">상승 예측</span>
        <span className={percent >= 50 ? "text-red-500" : "text-blue-500"}>
          {percent}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getColor()}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default PredictionProgress;
