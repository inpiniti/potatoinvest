"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dayjs from "dayjs";

export const description = "An interactive area chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  clos: {
    label: "종가",
    color: "var(--chart-1)",
  },
};

export function ChartAreaDefault({ dailyPriceData, onChange }) {
  const [selectedTab, setSelectedTab] = React.useState("0"); // Default to "일"

  const filteredData = dailyPriceData
    ?.map((item) => {
      return {
        xymd: dayjs(item.xymd).format("YYYY-MM-DD"),
        clos: item.clos,
      };
    })
    ?.reverse();

  const handleTabChange = (value) => {
    setSelectedTab(value);
    if (onChange) {
      onChange(value); // Call onChange with the selected tab value
    }
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>미국주식시세</CardTitle>
          <CardDescription>
            미국의 경우 0분지연시세로 제공되나, 장중 당일 시가는 상이할 수
            있으며, 익일 정정 표시됩니다. 별도 일봉을 제공하지 않고 당일 시세만
            제공하고 있습니다.
          </CardDescription>
        </div>
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <TabsList className="rounded-lg">
            <TabsTrigger value="0">일</TabsTrigger>
            <TabsTrigger value="1">주</TabsTrigger>
            <TabsTrigger value="2">월</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-gray-400)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-gray-400)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="xymd"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="clos"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-gray-400)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
