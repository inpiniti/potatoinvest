"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useQuotations from "@/hooks/useQuotations";
import dayjs from "dayjs";

const ConfirmationCard = ({
  data,
  type,
  onConfirm,
  onCancel,
  predictionData,
  marketData,
}) => {
  const [active, setActive] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const { 기간별시세 } = useQuotations();

  // 종목 코드에 따른 차트 데이터 로드
  useEffect(() => {
    const loadChartData = async () => {
      if (!data?.종목코드) return;

      setLoading(true);
      try {
        const 조회데이터 = await 기간별시세({
          종목코드: data.종목코드,
          구분: "0", // 일봉
          수정주가반영여부: "1",
        });

        if (조회데이터 && Array.isArray(조회데이터)) {
          // 데이터 처리
          const processedData = 조회데이터
            .slice(0, 15)
            .map((item) => ({
              ...item,
              clos: parseFloat(item.clos || 0),
              rate: parseFloat(
                (item.rate || "0").replace("+", "").replace("-", "-")
              ),
              tvol: parseInt(item.tvol || 0, 10),
              isPositive: item.sign === "2", // 상승인 경우 true
            }))
            .reverse();

          setChartData(processedData);
        }
      } catch (error) {
        console.error("차트 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [data?.종목코드, 기간별시세]);

  // 차트 도메인 설정
  const yAxisDomain = () => {
    if (chartData.length === 0) return [0, 0];

    // 종가 기준 도메인 계산
    const values = chartData.map((d) => d.clos);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // 10% 여백
    return [Math.max(0, min - padding), max + padding];
  };

  // 거래 타입에 따른 제목
  const getTitle = () => {
    switch (type) {
      case "buy":
        return `${data?.종목명} 매수 확인`;
      case "sell":
        return `${data?.종목명} 매도 확인`;
      case "average":
        return `${data?.종목명} 물타기 확인`;
      default:
        return "거래 확인";
    }
  };

  // 차트 설정
  const chartConfig = {
    clos: {
      label: "종가",
      color: "#a3a3a3",
    },
  };

  // 탭 내용 렌더링
  const renderTabContent = () => {
    switch (active) {
      case "chart":
        return (
          <div className="h-64 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart
                  data={chartData}
                  accessibilityLayer
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="xymd"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => dayjs(value).format("MM/DD")}
                    fontSize={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={yAxisDomain()}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    width={50}
                    fontSize={10}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="clos" radius={[4, 4, 0, 0]}>
                    {chartData.map((item, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={item.isPositive ? "#ef4444" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                차트 데이터가 없습니다.
              </div>
            )}
          </div>
        );

      case "indicators":
        return (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {predictionData &&
              Object.entries(predictionData)
                .filter(
                  ([key]) =>
                    key !== "name" &&
                    key !== "description" &&
                    key !== "logoid" &&
                    key !== "예측결과"
                )
                .sort()
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500">{key}</span>
                    <span
                      className={`font-medium ${
                        key.includes("perf") || key.includes("rate")
                          ? Number(value) > 0
                            ? "text-red-500"
                            : "text-blue-500"
                          : ""
                      }`}
                    >
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </span>
                  </div>
                ))}
          </div>
        );

      case "market":
        return (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {marketData &&
              Object.entries(marketData)
                .filter(([key]) =>
                  [
                    "perx",
                    "pbrx",
                    "high",
                    "low",
                    "open",
                    "h52p",
                    "l52p",
                    "epsx",
                    "bpsx",
                    "pvol",
                    "tvol",
                  ].includes(key)
                )
                .map(([key, value]) => {
                  const label = {
                    perx: "PER",
                    pbrx: "PBR",
                    high: "고가",
                    low: "저가",
                    open: "시가",
                    h52p: "52주 고가",
                    l52p: "52주 저가",
                    epsx: "EPS",
                    bpsx: "BPS",
                    pvol: "거래량(전일)",
                    tvol: "거래량(당일)",
                  }[key];

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {label || key}
                      </span>
                      <span className="font-medium">
                        {["high", "low", "open", "h52p", "l52p"].includes(key)
                          ? `$${Number(value).toFixed(2)}`
                          : ["pvol", "tvol"].includes(key)
                          ? Number(value).toLocaleString()
                          : value}
                      </span>
                    </div>
                  );
                })}
          </div>
        );

      case "basic":
      default:
        return (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-gray-500">종목코드:</span>
                <div className="font-medium">{data?.종목코드}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">현재가:</span>
                <div className="font-medium">
                  ${Number(data?.현재가).toFixed(2)}
                </div>
              </div>

              {data?.평균매수가 && (
                <div>
                  <span className="text-sm text-gray-500">평균매수가:</span>
                  <div className="font-medium">
                    ${Number(data?.평균매수가).toFixed(2)}
                  </div>
                </div>
              )}

              {data?.수익률 && (
                <div>
                  <span className="text-sm text-gray-500">수익률:</span>
                  <div
                    className={`font-medium flex items-center ${
                      Number(data.수익률) > 0 ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    {Number(data.수익률) > 0 ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    {Number(data.수익률).toFixed(2)}%
                  </div>
                </div>
              )}

              {data?.예측률 && (
                <div>
                  <span className="text-sm text-gray-500">AI 예측:</span>
                  <div className="font-bold">{data?.예측률}</div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // 거래 타입에 따른 버튼 색상
  const getButtonStyle = () => {
    switch (type) {
      case "buy":
        return "bg-red-500 hover:bg-red-600";
      case "sell":
        return "bg-blue-500 hover:bg-blue-600";
      case "average":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>거래를 진행하시겠습니까?</CardDescription>
      </CardHeader>

      <Tabs
        defaultValue="basic"
        value={active}
        onValueChange={setActive}
        className="w-full"
      >
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="basic">기본정보</TabsTrigger>
            <TabsTrigger value="chart">차트</TabsTrigger>
            <TabsTrigger value="indicators">지표</TabsTrigger>
            <TabsTrigger value="market">시장데이터</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4">
          <TabsContent value={active} className="m-0">
            {renderTabContent()}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button className={getButtonStyle()} onClick={onConfirm}>
          {type === "buy" ? "매수" : type === "sell" ? "매도" : "물타기"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfirmationCard;
