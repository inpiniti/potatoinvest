import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DividendMetric {
  analysis: string;
  score: number;
  value: number;
}

interface DividendData {
  averageScore: number;
  continuous_dividend_growth: DividendMetric;
  continuous_dividend_payout: DividendMetric;
  dividend_payout_ratio_ttm: DividendMetric;
  dividends_yield_current: DividendMetric;
  dps_common_stock_prim_issue_yoy_growth_fy: DividendMetric;
  overallAnalysis: string;
}

const metricConfig = {
  continuous_dividend_growth: {
    label: "배당 성장",
    icon: TrendingUp,
    color: "#10b981",
    shortName: "성장",
  },
  continuous_dividend_payout: {
    label: "지급 연속성",
    icon: BarChart3,
    color: "#3b82f6",
    shortName: "연속성",
  },
  dividend_payout_ratio_ttm: {
    label: "지급비율",
    icon: Target,
    color: "#8b5cf6",
    shortName: "비율",
  },
  dividends_yield_current: {
    label: "배당수익률",
    icon: DollarSign,
    color: "#f59e0b",
    shortName: "수익률",
  },
  dps_common_stock_prim_issue_yoy_growth_fy: {
    label: "DPS 성장",
    icon: TrendingUp,
    color: "#ef4444",
    shortName: "DPS",
  },
};

export function DividendAnalysis({ data }: { data: DividendData }) {
  // 데이터 유효성 검사
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    배당 데이터 없음
                  </h3>
                  <p className="text-gray-500">
                    현재 선택된 종목의 배당 분석 데이터를 불러올 수 없습니다.
                    <br />
                    워커가 분석을 완료할 때까지 잠시 기다려 주세요.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 필수 필드들이 없는 경우에 대한 기본값 설정
  const safeData = {
    averageScore: data.averageScore || 0,
    overallAnalysis:
      data.overallAnalysis || "배당 분석 데이터를 처리 중입니다...",
    continuous_dividend_growth: data.continuous_dividend_growth || {
      analysis: "데이터 없음",
      score: 0,
      value: 0,
    },
    continuous_dividend_payout: data.continuous_dividend_payout || {
      analysis: "데이터 없음",
      score: 0,
      value: 0,
    },
    dividend_payout_ratio_ttm: data.dividend_payout_ratio_ttm || {
      analysis: "데이터 없음",
      score: 0,
      value: 0,
    },
    dividends_yield_current: data.dividends_yield_current || {
      analysis: "데이터 없음",
      score: 0,
      value: 0,
    },
    dps_common_stock_prim_issue_yoy_growth_fy:
      data.dps_common_stock_prim_issue_yoy_growth_fy || {
        analysis: "데이터 없음",
        score: 0,
        value: 0,
      },
  };

  // 레이달 차트용 데이터 준비
  const chartData = Object.entries(safeData)
    .filter(([key]) => key !== "averageScore" && key !== "overallAnalysis")
    .map(([key, metric]) => {
      const config = metricConfig[key as keyof typeof metricConfig];
      if (
        !config ||
        typeof metric !== "object" ||
        metric === null ||
        !("score" in metric)
      )
        return null;
      return {
        name: config.shortName,
        value: Math.max(0, Math.min(100, (metric.score / 5) * 100)), // 0-100 범위로 제한
        score: metric.score || 0,
        fill: config.color,
        actualValue: metric.value || 0,
      };
    })
    .filter(Boolean); // null 값들 제거

  // 전체 점수 차트 데이터
  const overallChartData = [
    {
      name: "점수",
      value: Math.max(0, Math.min(100, (safeData.averageScore / 5) * 100)),
      fill:
        safeData.averageScore >= 3
          ? "#10b981"
          : safeData.averageScore >= 2
          ? "#f59e0b"
          : "#ef4444",
    },
  ];

  const formatValue = (value: number, key: string) => {
    if (key.includes("yield") || key.includes("ratio")) {
      return value < 1
        ? `${(value * 100).toFixed(3)}%`
        : `${value.toFixed(2)}%`;
    }
    return value.toString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">배당 분석 리포트</h1>
        <p className="text-gray-600">
          종합적인 배당 성과 분석 결과를 확인해보세요
        </p>
      </div>

      {/* Overall Analysis Alert */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          {safeData.overallAnalysis}
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Score Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <CardTitle>종합 점수</CardTitle>
            <p className="text-sm text-muted-foreground">전체 배당 성과 평가</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { value: (safeData.averageScore / 5) * 100 },
                      {
                        value: 100 - (safeData.averageScore / 5) * 100,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill={overallChartData[0].fill} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {safeData.averageScore.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">/ 5.0</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge
                variant={
                  safeData.averageScore >= 3
                    ? "default"
                    : safeData.averageScore >= 2
                    ? "secondary"
                    : "destructive"
                }
                className="px-4 py-1"
              >
                {safeData.averageScore >= 3
                  ? "양호"
                  : safeData.averageScore >= 2
                  ? "보통"
                  : "개선필요"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>세부 지표 분석</CardTitle>
            <p className="text-sm text-muted-foreground">
              각 배당 지표별 성과 현황
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="80%"
                data={chartData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontSize: 12,
                  }}
                  background
                  dataKey="value"
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Chart Legend */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {Object.entries(metricConfig).map(([key, config]) => {
                const metric = safeData[
                  key as keyof typeof safeData
                ] as DividendMetric;
                if (!metric) return null;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    <span className="text-xs text-gray-600">
                      {config.shortName} ({(metric.score || 0).toFixed(1)})
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(safeData).map(([key, metric]) => {
          if (
            key === "averageScore" ||
            key === "overallAnalysis" ||
            !metric ||
            typeof metric !== "object" ||
            !("analysis" in metric)
          )
            return null;

          const config = metricConfig[key as keyof typeof metricConfig];
          if (!config) return null;

          const IconComponent = config.icon;

          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: `${config.color}20`,
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: config.color }}
                      />
                    </div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                  </div>
                  <Badge
                    variant={
                      (metric.score || 0) >= 4
                        ? "default"
                        : (metric.score || 0) >= 2
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {(metric.score || 0).toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">현재 값</span>
                  <span className="font-semibold">
                    {formatValue(metric.value || 0, key)}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{metric.analysis}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">투자 참고사항</p>
              <p className="text-sm text-blue-700">
                본 분석은 과거 데이터를 기반으로 하며, 미래 성과를 보장하지
                않습니다. 투자 결정 시 다양한 요소를 종합적으로 검토하시기
                바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
