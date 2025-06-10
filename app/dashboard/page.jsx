'use client';

import { Separator } from '@/components/ui/separator';
import {
  Wallet, // 잔고에 적합한 지갑 아이콘
  CheckSquare, // 체결에 적합한 체크 아이콘
  Clock, // 미체결에 적합한 시계 아이콘
  LineChart, // 기간손익에 적합한 차트 아이콘
  BarChart3, // 분석에 적합한 분석 차트 아이콘
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import useAnalysis from './hooks/useAnalysis'; // 분석 데이터 훅
import useUntraded from './hooks/useUntraded'; // 미체결 데이터 훅
import useHolding from './hooks/useHolding'; // 보유 종목 데이터 훅
import useCnnl from './hooks/useCnnl'; // 체결 데이터 훅
import useProfit from './hooks/useProfit'; // 기간 손익 데이터 훅

import SettingsButton from '../page/log/components/header/buttons/SettingsButton';
import AutoPlayToggle from '../page/log/components/header/navigation/AutoPlayToggle';
import BuyToggle from '../page/log/components/header/navigation/BuyToggle';
import SellToggle from '../page/log/components/header/navigation/SellToggle';

import PageWrap from './components/PageWrap';
import Header from './components/Header';
import Aside from './components/Aside';
import Main from './components/Main';
import SectionHeader from './components/SectionHeader';
import SectionTitle from './components/SectionTitle';
import SectionTitleItem from './components/SectionTitleItem';
import LoginButton from './components/LoginButton';

const data = {
  navMain: [
    {
      title: '잔고',
      url: '#',
      icon: Wallet,
      isActive: true,
    },
    {
      title: '체결',
      url: '#',
      icon: CheckSquare,
      isActive: false,
    },
    {
      title: '미체결',
      url: '#',
      icon: Clock,
      isActive: false,
    },
    {
      title: '기간손익',
      url: '#',
      icon: LineChart,
      isActive: false,
    },
    {
      title: '분석',
      url: '#',
      icon: BarChart3,
      isActive: false,
    },
  ],
};

export default function DashBoardPage() {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [current, setCurrent] = useState();

  //const [mails, setMails] = useState(data.mails);

  // 분석 데이터
  const { analysisData } = useAnalysis(120000); // 분석
  const { untradedData } = useUntraded(120000); // 미체결
  const { holdingData } = useHolding(120000); // 잔고
  const { data: cnnlData } = useCnnl(120000); // 체결 데이터
  const { profitData, fetchProfitData } = useProfit(); // 기간 손익

  const [autoPlay, toggleAutoPlay] = useState(false);
  const [autoBuy, toggleAutoBuy] = useState(false);
  const [autoSell, toggleAutoSell] = useState(false);

  const [list, setList] = useState(analysisData);

  const handleMenuChange = (newActive) => {
    setActiveItem(newActive);
    switch (newActive?.title) {
      case '잔고':
        setList(holdingData);
        break;
      case '미체결':
        setList(untradedData);
        break;
      case '분석':
        setList(analysisData);
        break;
      case '체결':
        setList(cnnlData);
        break;
      case '기간손익':
        setList(profitData);
        break;
      default:
        setList([]);
    }
  };

  const dataInitialized = useRef(false);

  useEffect(() => {
    // Only set the list once when holdingData is first available
    if (holdingData && holdingData.length > 0 && !dataInitialized.current) {
      fetchProfitData();
      setList(holdingData);
      dataInitialized.current = true;
    }
  }, [holdingData]);

  return (
    <PageWrap>
      <Header
        data={data}
        activeItem={activeItem}
        onChange={(item) => handleMenuChange(item)}
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
          {list?.map((analysis, index) => (
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
