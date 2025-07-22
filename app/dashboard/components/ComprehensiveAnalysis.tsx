import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Shield,
  LineChart,
  Calculator,
  Award,
  Info,
  Star,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DetailMetric {
  지표명: string;
  한글명: string;
  현재값: number;
  점수: number;
  등급: string;
  해석: string;
}

interface CategoryData {
  지표들: Record<string, DetailMetric>;
  평균점수: number;
  해석: string;
  데이터개수: number;
}

interface ComprehensiveData {
  오버뷰평가: CategoryData;
  손익계산평가: CategoryData;
  수익성지표평가: CategoryData;
  배당지표평가: CategoryData;
  대차대조표평가: CategoryData;
  기술등급평가: CategoryData;
  평가지표평가: CategoryData;
  종합평가: {
    총점수: number;
    해석: string;
    평가된지표수: number;
    지표별점수: Record<string, number>;
  };
}

const categoryConfig = {
  오버뷰평가: {
    label: "오버뷰",
    icon: Star,
    color: "#6366f1",
    shortName: "오버뷰",
  },
  손익계산평가: {
    label: "손익계산서",
    icon: TrendingUp,
    color: "#10b981",
    shortName: "손익",
  },
  수익성지표평가: {
    label: "수익성 지표",
    icon: DollarSign,
    color: "#3b82f6",
    shortName: "수익성",
  },
  배당지표평가: {
    label: "배당 지표",
    icon: BarChart3,
    color: "#8b5cf6",
    shortName: "배당",
  },
  대차대조표평가: {
    label: "재무 안정성",
    icon: Shield,
    color: "#f59e0b",
    shortName: "안정성",
  },
  기술등급평가: {
    label: "기술적 분석",
    icon: LineChart,
    color: "#ef4444",
    shortName: "기술분석",
  },
  평가지표평가: {
    label: "밸류에이션",
    icon: Calculator,
    color: "#06b6d4",
    shortName: "밸류",
  },
};

const getScoreColor = (score: number) => {
  if (score >= 4) return "#10b981";
  if (score >= 3) return "#3b82f6";
  if (score >= 2) return "#f59e0b";
  return "#ef4444";
};

const getScoreBadgeVariant = (
  score: number
): "default" | "secondary" | "destructive" | "outline" => {
  if (score >= 4) return "default";
  if (score >= 3) return "secondary";
  if (score >= 2) return "outline";
  return "destructive";
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "매우우수":
    case "적극매수":
      return "bg-green-100 text-green-800";
    case "우수":
    case "양호":
    case "매수":
      return "bg-blue-100 text-blue-800";
    case "보통":
      return "bg-yellow-100 text-yellow-800";
    case "매도":
    case "높음":
      return "bg-orange-100 text-orange-800";
    case "매우낮음":
    case "매우위험":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function ComprehensiveAnalysis({ data }: { data: ComprehensiveData }) {
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertDescription>데이터가 없습니다.</AlertDescription>
        </Alert>
      </div>
    );
  }
  // 레이더 차트용 데이터 준비
  const radarData = Object.entries(data)
    .filter(([key]) => key !== "종합평가")
    .map(([key, category]) => {
      const config = categoryConfig[key as keyof typeof categoryConfig];
      return {
        category: config?.shortName,
        score: category.평균점수,
        fullName: config?.label,
        color: config?.color,
      };
    });

  // 전체 점수 차트 데이터
  const overallScore = data.종합평가.총점수;
  const overallChartData = [
    {
      name: "점수",
      value: (overallScore / 5) * 100,
      fill: getScoreColor(overallScore),
    },
  ];

  // 각 카테고리별 레이더 차트 데이터 생성
  const getCategoryRadarData = (categoryData: CategoryData) => {
    return Object.entries(categoryData.지표들).map(([key, metric]) => ({
      metric: key.length > 6 ? key.substring(0, 6) + "..." : key,
      score: metric.점수,
      fullName: metric.한글명,
    }));
  };

  const formatValue = (value: number, metric: DetailMetric) => {
    if (
      metric.한글명.includes("%") ||
      metric.한글명.includes("비율") ||
      metric.한글명.includes("마진")
    ) {
      return `${value?.toFixed(2)}%`;
    }
    if (metric.한글명.includes("년")) {
      return `${value}년`;
    }
    return value?.toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border">
          <Award className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            종합 재무 분석 리포트
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          기업의 종합적인 재무 건전성과 투자 매력도를 분석합니다
        </p>
      </div>

      {/* Overall Analysis Alert */}
      <Alert className={`border-green-200 bg-green-50`}>
        <Star className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {data.종합평가.해석}
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Score Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <CardTitle>종합 점수</CardTitle>
            <p className="text-sm text-muted-foreground">전체 재무 성과 평가</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { value: (overallScore / 5) * 100 },
                      { value: 100 - (overallScore / 5) * 100 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    <Cell fill={overallChartData[0].fill} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {overallScore?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">/ 5.0</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge
                variant={getScoreBadgeVariant(overallScore)}
                className="px-4 py-1"
              >
                {overallScore >= 4
                  ? "우수"
                  : overallScore >= 3
                  ? "양호"
                  : overallScore >= 2
                  ? "보통"
                  : "개선필요"}
              </Badge>
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {data.종합평가.평가된지표수}개 지표 분석
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>카테고리별 분석</CardTitle>
            <p className="text-sm text-muted-foreground">
              7개 영역별 종합 성과 현황
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Chart Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {radarData.map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.fullName} ({item.score?.toFixed(1)})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview with Radar Charts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          항목별 분석 결과
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data).map(([key, category]) => {
            if (key === "종합평가") return null;

            const config = categoryConfig[key as keyof typeof categoryConfig];
            const IconComponent = config?.icon;
            const categoryRadarData = getCategoryRadarData(category);

            return (
              <Card
                key={key}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${config?.color}20` }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: config?.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {config?.label}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {category.데이터개수}개 지표
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getScoreBadgeVariant(category.평균점수)}
                      className="text-sm font-semibold"
                    >
                      {category.평균점수?.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 레이더 차트 추가 */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={categoryRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="metric"
                            tick={{ fontSize: 10 }}
                          />
                          <PolarRadiusAxis
                            domain={[0, 5]}
                            tick={{ fontSize: 8 }}
                            angle={90}
                          />
                          <Radar
                            dataKey="score"
                            stroke={config?.color}
                            fill={config?.color}
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{category.해석}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">평가 점수</span>
                        <span className="font-medium">
                          {category.평균점수?.toFixed(2)} / 5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(category.평균점수 / 5) * 100}%`,
                            backgroundColor: getScoreColor(category.평균점수),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Metrics with Pie Charts */}
      {Object.entries(data).map(([categoryKey, category]) => {
        if (categoryKey === "종합평가") return null;

        const config =
          categoryConfig[categoryKey as keyof typeof categoryConfig];

        return (
          <div key={categoryKey}>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${config?.color}20` }}
              >
                <config.icon
                  className="w-4 h-4"
                  style={{ color: config?.color }}
                />
              </div>
              {config?.label} 세부 지표
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Object.entries(category.지표들).map(([metricKey, metric]) => {
                const typedMetric = metric as DetailMetric;
                const pieData = [
                  {
                    value: (typedMetric.점수 / 5) * 100,
                    fill: getScoreColor(typedMetric.점수),
                  },
                  {
                    value: 100 - (typedMetric.점수 / 5) * 100,
                    fill: "#f3f4f6",
                  },
                ];

                return (
                  <Card
                    key={metricKey}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {typedMetric.한글명}
                        </CardTitle>
                        <Badge
                          variant={getScoreBadgeVariant(typedMetric.점수)}
                          className="text-xs"
                        >
                          {typedMetric.점수?.toFixed(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* 파이 차트 추가 */}
                      <div className="relative h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={35}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                              cornerRadius={4}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {typedMetric.점수?.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">현재 값</span>
                        <span className="font-semibold text-sm">
                          {formatValue(typedMetric.현재값, typedMetric)}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium text-center ${getGradeColor(
                          typedMetric.등급
                        )}`}
                      >
                        {typedMetric.등급}
                      </div>

                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-700">
                          {typedMetric.해석}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Info Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                종합 분석 참고사항
              </p>
              <p className="text-sm text-blue-700">
                본 분석은 다양한 재무 지표를 종합하여 산출된 결과입니다. 투자
                결정 시 시장 상황, 업종 특성, 거시경제 환경 등을 추가로
                고려하시기 바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
