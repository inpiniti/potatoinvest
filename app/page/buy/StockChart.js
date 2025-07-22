'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import dayjs from 'dayjs';
import useQuotations from '@/hooks/useQuotations';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 종목 차트 컴포넌트
const StockChart = ({ ticker }) => {
  // 샘플 차트 데이터
  //   const generateSampleData = () => {
  //     const basePrice = 100 + Math.random() * 50;
  //     const data = [];

  //     for (let i = 0; i < 30; i++) {
  //       const change = (Math.random() - 0.5) * 4;
  //       const lastPrice =
  //         data.length > 0 ? data[data.length - 1].price : basePrice;
  //       const price = lastPrice + change;
  //       data.push({
  //         date: `${i + 1}일`,
  //         price: parseFloat(price?.toFixed(2)),
  //         volume: Math.floor(Math.random() * 1000) + 500,
  //       });
  //     }

  //     return data;
  //   };

  //const chartData = useMemo(() => generateSampleData(), [ticker]);
  const { 기간별시세 } = useQuotations();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [구분, set구분] = useState('0'); // 0: 일봉, 1: 주봉, 2: 월봉
  const [수정주가반영여부, set수정주가반영여부] = useState('0'); // 0: 수정주가 미반영, 1: 수정주가 반영
  const [displayOption, setDisplayOption] = useState('clos'); // 표시할 데이터: clos(종가), rate(등락률), tvol(거래량)

  // 데이터 전처리 - 차트 데이터를 숫자로 변환
  const processedChartData = useMemo(() => {
    return (chartData || []).map((item) => ({
      ...item,
      clos: parseFloat(item.clos || 0),
      rate: parseFloat((item.rate || '0').replace('+', '').replace('-', '-')),
      tvol: parseInt(item.tvol || 0, 10),
      isPositive: item.sign === '2', // 상승인 경우 true
    }));
  }, [chartData]);

  // 현재 표시 옵션에 따른 Y축 도메인 계산
  const yAxisDomain = useMemo(() => {
    if (processedChartData.length === 0) return [0, 0];

    switch (displayOption) {
      case 'clos': {
        // 종가는 최소값과 최대값에 약간의 여백을 추가
        const values = processedChartData.map((d) => d.clos);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1; // 10% 여백
        return [Math.max(0, min - padding), max + padding];
      }
      case 'rate': {
        // 등락률은 양수/음수 범위를 고려
        const values = processedChartData.map((d) => d.rate);
        const min = Math.min(...values);
        const max = Math.max(...values);
        // 양수/음수 중 절대값이 큰 쪽을 기준으로 대칭 범위 설정
        const absMax = Math.max(Math.abs(min), Math.abs(max));
        const padding = absMax * 0.1; // 10% 여백
        return [-absMax - padding, absMax + padding];
      }
      case 'tvol': {
        // 거래량은 0부터 최대값까지 (하한은 항상 0)
        const values = processedChartData.map((d) => d.tvol);
        const max = Math.max(...values);
        return [0, max * 1.1]; // 10% 여백
      }
      default:
        return ['auto', 'auto'];
    }
  }, [processedChartData, displayOption]);

  useEffect(() => {
    조회();
  }, [ticker, 구분, 수정주가반영여부]);

  const 조회 = async () => {
    try {
      setLoading(true);
      const 조회데이터 = await 기간별시세({
        종목코드: ticker,
        구분: 구분,
        수정주가반영여부: 수정주가반영여부,
      });
      setChartData(조회데이터.slice(0, 15).reverse());
    } catch (error) {
      console.error('차트 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // xymd 거래일자(YYYYMMDD)
  // clos 종가
  // sign 대비기호
  // diff 대비
  // rate 등락률
  // open 시가
  // high 고가
  // low 저가
  // tvol 거래량
  // tamt 거래대금
  // pbid 매도호가
  // vbid 매수호가잔량
  // pask 매도호가
  // vask 매도호가잔량

  const chartConfig = {
    clos: {
      label: '종가',
      color: '#a3a3a3',
    },
    tvol: {
      label: '거래량',
      color: '#6366f1',
    },
    rate: {
      label: '등락률',
      color: '#a3a3a3',
    },
  };

  // 주기 선택 옵션
  const periodOptions = [
    { value: '0', label: '일봉' },
    { value: '1', label: '주봉' },
    { value: '2', label: '월봉' },
  ];

  // 표시 데이터 선택 옵션
  const displayOptions = [
    { value: 'clos', label: '종가' },
    { value: 'rate', label: '등락률' },
    { value: 'tvol', label: '거래량' },
  ];

  // 표시 데이터에 따른 Y축 포맷
  const getYAxisTickFormatter = () => {
    switch (displayOption) {
      case 'clos':
        return (value) => `$${value?.toFixed(2)}`;
      case 'rate':
        return (value) => `${value}%`;
      case 'tvol':
        return (value) =>
          value >= 1000000
            ? `${(value / 1000000)?.toFixed(1)}M`
            : value >= 1000
            ? `${(value / 1000)?.toFixed(0)}K`
            : value;
      default:
        return (value) => value;
    }
  };

  // 데이터 항목에 따른 값 판단
  const isPositiveValue = (item) => {
    switch (displayOption) {
      case 'rate':
        return parseFloat(item.rate) >= 0;
      case 'clos':
        return parseFloat(item.rate) >= 0;
      case 'tvol':
        // 거래량은 항상 양수이므로 true 반환
        return true;
      default:
        return true;
    }
  };

  return (
    <>
      {/* 차트 컨트롤 영역 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          {/* 주기 선택 탭 */}
          <Tabs
            defaultValue="0"
            value={구분}
            onValueChange={set구분}
            className="h-8"
          >
            <TabsList className="h-8">
              {periodOptions.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="text-xs px-3 h-7"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 수정주가 반영여부 스위치 */}
          <div className="flex items-center gap-2">
            <Switch
              id="adjust-price"
              checked={수정주가반영여부 === '1'}
              onCheckedChange={(checked) =>
                set수정주가반영여부(checked ? '1' : '0')
              }
            />
            <Label htmlFor="adjust-price" className="text-xs">
              수정주가 반영
            </Label>
          </div>
        </div>

        {/* 표시 항목 선택 탭으로 변경 */}
        <Tabs
          value={displayOption}
          onValueChange={setDisplayOption}
          className="h-8"
        >
          <TabsList className="h-8">
            {displayOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="text-xs px-3 h-7"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 새로고침 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={조회}
          disabled={loading}
          className="h-7 text-xs"
        >
          {loading ? '로딩중...' : '새로고침'}
        </Button>
      </div>

      <ChartContainer config={chartConfig} className="w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="xymd"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => dayjs(value).format('MM/DD')}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            domain={yAxisDomain}
            tickFormatter={getYAxisTickFormatter()}
            width={50}
            fontSize={10}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey={displayOption} radius={[4, 4, 0, 0]}>
            {processedChartData.map((item, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  // 표시 항목에 따라 다른 색상 로직 적용
                  displayOption === 'tvol'
                    ? '#6366f1' // 거래량은 항상 같은 색상
                    : isPositiveValue(item)
                    ? '#ef4444' // 양수/상승이면 빨간색
                    : '#3b82f6' // 음수/하락이면 파란색
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </>
  );
};

export default StockChart;
