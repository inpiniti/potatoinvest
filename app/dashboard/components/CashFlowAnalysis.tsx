import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Info,
  Banknote,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CashFlowMetric {
  analysis: string;
  score: number;
  value: number;
}

interface CashFlowData {
  averageScore: number;
  cash_f_operating_activities_ttm: CashFlowMetric;
  cash_f_financing_activities_ttm: CashFlowMetric;
  free_cash_flow_ttm: CashFlowMetric;
  overallAnalysis: string;
}

const metricConfig = {
  cash_f_operating_activities_ttm: {
    label: '영업활동 현금흐름',
    icon: TrendingUp,
    color: '#10b981',
    shortName: '영업',
    description: '본업으로 버는 돈',
  },
  cash_f_financing_activities_ttm: {
    label: '재무활동 현금흐름',
    icon: Banknote,
    color: '#8b5cf6',
    shortName: '재무',
    description: '자금조달 및 상환',
  },
  free_cash_flow_ttm: {
    label: '자유현금흐름(FCF)',
    icon: DollarSign,
    color: '#f59e0b',
    shortName: 'FCF',
    description: '자유롭게 쓸 수 있는 돈',
  },
};

export function CashFlowAnalysis({ data }: { data: CashFlowData }) {
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
                    현금흐름 데이터 없음
                  </h3>
                  <p className="text-gray-500">
                    현재 선택된 종목의 현금흐름 분석 데이터를 불러올 수
                    없습니다.
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
      data.overallAnalysis || '현금흐름 분석 데이터를 처리 중입니다...',
    cash_f_operating_activities_ttm: data.cash_f_operating_activities_ttm || {
      analysis: '데이터 없음',
      score: 0,
      value: 0,
    },
    cash_f_financing_activities_ttm: data.cash_f_financing_activities_ttm || {
      analysis: '데이터 없음',
      score: 0,
      value: 0,
    },
    free_cash_flow_ttm: data.free_cash_flow_ttm || {
      analysis: '데이터 없음',
      score: 0,
      value: 0,
    },
  };

  // 레이달 차트용 데이터 준비
  const chartData = Object.entries(safeData)
    .filter(([key]) => key !== 'averageScore' && key !== 'overallAnalysis')
    .map(([key, metric]) => {
      const config = metricConfig[key as keyof typeof metricConfig];
      if (
        !config ||
        typeof metric !== 'object' ||
        metric === null ||
        !('score' in metric)
      )
        return null;
      return {
        name: config.shortName,
        value: Math.max(0, Math.min(100, ((metric.score || 0) / 5) * 100)), // 0-100 범위로 제한
        score: metric.score || 0,
        fill: config.color,
        actualValue: (metric.value as number) || 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null); // null 값들 제거

  // 전체 점수 차트 데이터
  const overallChartData = [
    {
      name: '점수',
      value: Math.max(0, Math.min(100, (safeData.averageScore / 5) * 100)),
      fill:
        safeData.averageScore >= 3
          ? '#10b981'
          : safeData.averageScore >= 2
          ? '#f59e0b'
          : '#ef4444',
    },
  ];

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000000000) {
      return `${(value / 1000000000000)?.toFixed(2)}T`;
    } else if (absValue >= 1000000000) {
      return `${(value / 1000000000)?.toFixed(2)}B`;
    } else if (absValue >= 1000000) {
      return `${(value / 1000000)?.toFixed(2)}M`;
    } else {
      return `${value?.toFixed(2)}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          현금흐름 분석 리포트
        </h1>
        <p className="text-gray-600">
          영업·재무·FCF 3대 핵심 지표로 현금흐름을 분석합니다
        </p>
      </div>

      {/* Overall Analysis Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          {safeData.overallAnalysis}
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Score Chart */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <CardTitle>종합 점수</CardTitle>
            <p className="text-sm text-muted-foreground">
              전체 현금흐름 성과 평가
            </p>
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
                    {safeData.averageScore?.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">/ 5.00</div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Badge
                variant={
                  safeData.averageScore >= 3
                    ? 'default'
                    : safeData.averageScore >= 2
                    ? 'secondary'
                    : 'destructive'
                }
                className="px-4 py-1"
              >
                {safeData.averageScore >= 3
                  ? '건전'
                  : safeData.averageScore >= 2
                  ? '보통'
                  : '위험'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>세부 지표 분석</CardTitle>
            <p className="text-sm text-muted-foreground">
              각 현금흐름 지표별 성과 현황
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
                    position: 'insideStart',
                    fill: '#fff',
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
                ] as CashFlowMetric;
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
                      {config.shortName} ({(metric.score || 0)?.toFixed(2)})
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
            key === 'averageScore' ||
            key === 'overallAnalysis' ||
            !metric ||
            typeof metric !== 'object' ||
            !('analysis' in metric)
          )
            return null;

          const config = metricConfig[key as keyof typeof metricConfig];
          if (!config) return null;

          const IconComponent = config.icon;
          const isNegative = (metric.value || 0) < 0;

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
                    <div>
                      <CardTitle className="text-base">
                        {config.label}
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      (metric.score || 0) >= 4
                        ? 'default'
                        : (metric.score || 0) >= 2
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {(metric.score || 0)?.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">현재 값</span>
                  <span
                    className={`font-semibold ${
                      isNegative ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatValue(metric.value || 0)}
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
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-900">
                현금흐름 분석 가이드
              </p>
              <p className="text-sm text-green-700">
                <strong>영업활동</strong>: 높을수록 좋음 (실제 사업으로 버는
                현금) | <strong>재무활동</strong>: 상황에 따라 다름 (자금조달
                또는 상환) | <strong>자유현금흐름(FCF)</strong>: 높을수록 좋음
                (자유롭게 쓸 수 있는 돈)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
