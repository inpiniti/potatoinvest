"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sprout,
  Wallet, // 잔고에 적합한 지갑 아이콘
  CheckSquare, // 체결에 적합한 체크 아이콘
  Clock, // 미체결에 적합한 시계 아이콘
  LineChart, // 기간손익에 적합한 차트 아이콘
  BarChart3, // 분석에 적합한 분석 차트 아이콘
} from "lucide-react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import useAnalysis from "./hooks/useAnalysis"; // 분석 데이터 훅
import useUntraded from "./hooks/useUntraded"; // 미체결 데이터 훅
import useHolding from "./hooks/useHolding"; // 보유 종목 데이터 훅

import SettingsButton from "../page/log/components/header/buttons/SettingsButton";
import AutoPlayToggle from "../page/log/components/header/navigation/AutoPlayToggle";
import BuyToggle from "../page/log/components/header/navigation/BuyToggle";
import SellToggle from "../page/log/components/header/navigation/SellToggle";

import PageWrap from "./components/PageWrap";
import Header from "./components/Header";
import Aside from "./components/Aside";
import Main from "./components/Main";
import SectionHeader from "./components/SectionHeader";
import SectionTitle from "./components/SectionTitle";
import SectionTitleItem from "./components/SectionTitleItem";
import LoginButton from "./components/LoginButton";

type Analysis = {
  name: string; // 종목명
  description: string; // 종목 설명,
  logoid: string; // 로고 아이콘 URL
  operating_margin_ttm: string; // 운영 마진 (TTM)
  relative_volume_10d_calc: string; // 10일 상대 거래량 계산
  enterprise_value_to_revenue_ttm: string; // 기업 가치 대비 매출 (TTM)
  "Volatility.W": string; // 주간 변동성
  "Volatility.M": string; // 월간 변동성
  dividends_yield_current: string; // 현재 배당 수익률
  gap: string; // 갭
  volume_change: string; // 거래량 변화
  pre_tax_margin_ttm: string; // 세전 마진 (TTM)
  "Perf.1Y.MarketCap": string; // 1년 성과 (시가총액)
  "Perf.W": string; // 주간 성과
  "Perf.1M": string; // 1개월 성과
  "Perf.3M": string; // 3개월 성과
  "Perf.6M": string; // 6개월 성과
  "Perf.YTD": string; // 연초부터 현재까지의 성과
  "Perf.Y": string; // 1년 성과
  "Perf.5Y": string; // 5년 성과
  "Perf.10Y": string; // 10년 성과
  "Perf.All": string; // 전체 성과
  "Recommend.All": string; // 모든 추천
  "Recommend.MA": string; // 이동 평균 추천
  "Recommend.Other": string; // 기타 추천
  RSI: string; // 상대 강도 지수
  Mom: string; // 모멘텀
  CCI20: string; // 상품 채널 지수 20
  "Stoch.K": string; // 스토캐스틱 K
  "Stoch.D": string; // 스토캐스틱 D
  close: string; // 종가
  change: string; // 변화
  market: string; // 시장
};

const data = {
  navMain: [
    {
      title: "잔고",
      url: "#",
      icon: Wallet,
      isActive: true,
    },
    {
      title: "체결",
      url: "#",
      icon: CheckSquare,
      isActive: false,
    },
    {
      title: "미체결",
      url: "#",
      icon: Clock,
      isActive: false,
    },
    {
      title: "기간손익",
      url: "#",
      icon: LineChart,
      isActive: false,
    },
    {
      title: "분석",
      url: "#",
      icon: BarChart3,
      isActive: false,
    },
  ],
};

export default function DashBoardPage() {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [current, setCurrent] = useState<Analysis | undefined>();

  //const [mails, setMails] = useState(data.mails);

  // 분석 데이터
  const { analysisData } = useAnalysis(120000); // 2분마다 갱신
  const { untradedData } = useUntraded(120000); // 2분
  const { holdingData } = useHolding(120000); // 2분

  const [autoPlay, toggleAutoPlay] = useState(false);
  const [autoBuy, toggleAutoBuy] = useState(false);
  const [autoSell, toggleAutoSell] = useState(false);

  const [list, setList] = useState<Analysis[]>(analysisData);

  return (
    <PageWrap>
      <Header
        data={data}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        setList={setList}
        holdingData={holdingData}
        untradedData={untradedData}
        analysisData={analysisData}
      />
      <Aside
        activeItem={activeItem}
        list={list}
        current={current}
        setCurrent={setCurrent}
      />
      <Main>
        <SectionHeader>
          {/* 로그인 버튼 */}
          <LoginButton />
          {/* Settings button with toggles */}
          <SettingsButton>
            <AutoPlayToggle
              autoPlay={autoPlay}
              toggleAutoPlay={toggleAutoPlay}
            />
            <BuyToggle autoBuy={autoBuy} onToggleAutoBuy={toggleAutoBuy} />
            <SellToggle autoSell={autoSell} onToggleAutoSell={toggleAutoSell} />
          </SettingsButton>
        </SectionHeader>

        <SectionTitle
          current={current}
          setCurrent={setCurrent}
          analysisData={analysisData}
        >
          {list.map((analysis: Analysis, index: number) => (
            <SectionTitleItem
              key={index}
              current={current}
              analysis={analysis}
              setCurrent={setCurrent}
            />
          ))}
        </SectionTitle>
        <Separator className="mr-2 h-4" />
        <div className="h-full overflow-y-scroll flex flex-col gap-4 p-4 scrollbar-hide">
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">차트</TabsTrigger>
              <TabsTrigger value="stock">종목정보</TabsTrigger>
              <TabsTrigger value="news">뉴스</TabsTrigger>
              <TabsTrigger value="community">커뮤니티</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <div className="py-2">
                <CardTitle>차트</CardTitle>
                <CardDescription>가려워 죽겠다. 벌레가 있나?</CardDescription>
                <Separator className="my-4" />
                <Card className="bg-white">
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="@peduarte" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save changes</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="stock">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password here. After saving, ll be logged out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="current">Current password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="news">news</TabsContent>
            <TabsContent value="community">community</TabsContent>
          </Tabs>
        </div>
      </Main>
    </PageWrap>
  );
}
