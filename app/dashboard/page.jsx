'use client';

import { Separator } from '@/components/ui/separator';
import {
  Wallet, // 잔고에 적합한 지갑 아이콘
  CheckSquare, // 체결에 적합한 체크 아이콘
  Clock, // 미체결에 적합한 시계 아이콘
  LineChart, // 기간손익에 적합한 차트 아이콘
  BarChart3, // 분석에 적합한 분석 차트 아이콘
  ArrowLeft, // "<"
  ArrowRight, // ">"
  ShieldAlert,
  NotepadTextDashed,
  // 설정
  Settings,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import useToken from '@/hooks/useToken'; // 토큰 유효성 검사 훅

import useAnalysis from './hooks/useAnalysis'; // 분석 데이터 훅
import useHolding from './hooks/useHolding'; // 보유 종목 데이터 훅
import useCnnl from './hooks/useCnnl'; // 체결 데이터 훅
import useProfit from './hooks/useProfit'; // 기간 손익 데이터 훅
import useSearchInfo from './hooks/useSearchInfo'; // 현재가 상세 정보 훅
import useDailyprice from './hooks/useDailyprice'; // 기간별 시세 훅
import useNewsCommunity from './hooks/useNewsCommunity'; // 뉴스 및 커뮤니티 훅
import useExchangeRate from './hooks/useExchangeRate'; // 환율 훅

import SettingsButton from '../page/log/components/header/buttons/SettingsButton';
import AutoPlayToggle from '../page/log/components/header/navigation/AutoPlayToggle';
import BuyToggle from '../page/log/components/header/navigation/BuyToggle';
import SellToggle from '../page/log/components/header/navigation/SellToggle';

import PageWrap from './components/PageWrap';
import Header from './components/Header';
import Aside from './components/Aside';
import AsideItem from './components/AsideItem';
import Main from './components/Main';
import SectionHeader from './components/SectionHeader';
import SectionTitle from './components/SectionTitle';
import SectionTitleItem from './components/SectionTitleItem';
import LoginButton from './components/LoginButton';
import { ChartAreaDefault } from './components/ChartAreaDefault';

import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';

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

const KEY_MAP = {
  잔고: 'ovrs_pdno',
  체결: 'pdno',
  미체결: 'pdno',
  기간손익: 'ovrs_pdno',
  분석: 'name',
};

export default function DashBoardPage() {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [current, setCurrent] = useState(0);

  // 분석 데이터
  const { analysisData, isPending: analysisPending } = useAnalysis(120000); // 분석
  const { balanceData, isPending: balancePending } = useHolding(120000); // 잔고
  const holdingData = balanceData?.holdingData || [];
  const holdingData2 = balanceData?.output2 || {};
  const { data: cnnlData, isPending: cnnlPending } = useCnnl(120000); // 체결 데이터
  const {
    profitData,
    totalProfit,
    profitType,
    setProfitType,
    fetchProfitData,
    isPending: profitPending,
  } = useProfit(); // 기간 손익
  const { data: newsData, mutate: fetchNews } = useNewsCommunity(); // 뉴스 및 커뮤니티
  const { data: searchData, mutate: fetchSearchInfo } = useSearchInfo(); // 현재가 상세
  const { data: dailyPriceData, mutate: fetchDailyPrice } = useDailyprice(); // 기간별시세
  const { data: exchangeRateData, mutate: fetchExchangeRate } =
    useExchangeRate(); // 환율

  // 토큰이 유효한지 확인
  const { isTokenValid } = useToken();

  const PENDING_MAP = {
    잔고: balancePending,
    체결: cnnlPending,
    미체결: cnnlPending,
    기간손익: profitPending,
    분석: analysisPending,
  };

  const krw = useMemo(
    () => Number(exchangeRateData?.usdToKrw),
    [exchangeRateData]
  );

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
        setList(cnnlData.filter((item) => item.prcs_stat_name !== '완료'));
        break;
      case '분석':
        setList(analysisData);
        break;
      case '체결':
        setList(cnnlData.filter((item) => item.prcs_stat_name === '완료'));
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
    // 환율은 한 번만 가져오도록 설정
    fetchExchangeRate();

    // 기간손익도 한 번만 가져오도록 설정
    //fetchProfitData();
  }, []);

  useEffect(() => {
    // Only set the list once when holdingData is first available
    if (holdingData && holdingData.length > 0 && !dataInitialized.current) {
      setList(holdingData);
      dataInitialized.current = true;
    }
  }, [holdingData]);

  useEffect(() => {
    const newItem = list[current];
    const code = newItem?.[KEY_MAP[activeItem?.title]];
    if (!code) return; // 코드가 없으면 아무 작업도 하지 않음
    fetchSearchInfo({
      PDNO: code,
    });
    fetchDailyPrice({
      SYMB: code,
    });
    fetchNews({
      code: code,
    });
  }, [current]);

  useEffect(() => {
    setList(profitData);
  }, [profitType]);

  const handleChartChange = (GUBN) => {
    const newItem = list[current];
    fetchDailyPrice({
      SYMB: newItem?.[KEY_MAP[activeItem?.title]],
      GUBN,
    });
  };

  return (
    <PageWrap>
      <Header
        data={data}
        activeItem={activeItem}
        onChange={(item) => handleMenuChange(item)}
      />
      <Aside
        activeItem={activeItem}
        length={list?.length || 0}
        subItems={
          activeItem?.title === '기간손익' && (
            <Tabs
              value={profitType}
              onValueChange={setProfitType}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="individual">개별</TabsTrigger>
                <TabsTrigger value="daily">일</TabsTrigger>
                <TabsTrigger value="monthly">월</TabsTrigger>
              </TabsList>
            </Tabs>
          )
        }
      >
        {activeItem?.title === '기간손익' && (
          <div className="flex">
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">총 매매손익</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(totalProfit?.totalProfit).toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
                (
                {(
                  (Number(totalProfit?.totalProfit) /
                    Number(totalProfit?.totalInvestment)) *
                  100
                ).toFixed(1)}
                %)
              </div>
            </div>
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">총 매매금액</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(totalProfit?.totalInvestment).toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeItem?.title === '잔고' && (
          <div className="flex">
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">매입금액</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.frcr_pchs_amt1 * krw).toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">실현수익</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.ovrs_tot_pfls * krw).toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
                ({Number(holdingData2?.tot_pftrt).toFixed(1)}
                %)
              </div>
            </div>
          </div>
        )}
        {PENDING_MAP[activeItem?.title] ? (
          isTokenValid ? (
            <>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
              <div className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight box-border">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="whitespace-pre-wrap h-5 w-20" />
                  <Skeleton className="ml-auto text-xs h-4 w-10" />
                </div>
                <Skeleton className="font-medium h-4 w-20" />
                <Skeleton className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs h-4" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 pt-16 text-neutral-500">
              <ShieldAlert size={28} />
              <p>로그인을 해야 사용이 가능합니다.</p>
            </div>
          )
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pt-16 text-neutral-500">
            <NotepadTextDashed size={28} />
            <p>데이터가 없습니다.</p>
          </div>
        ) : (
          <>
            {list?.map((item, index) => {
              if (activeItem?.title === '잔고') {
                return (
                  <AsideItem
                    key={item?.ovrs_pdno}
                    title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                    date={`${item?.evlu_pfls_rt}%`}
                    info={`${Number(item?.frcr_pchs_amt1).toFixed(
                      2
                    )} > ${Number(item?.ovrs_stck_evlu_amt).toFixed(
                      2
                    )} (${Number(
                      (Number(item?.frcr_evlu_pfls_amt) * krw).toFixed(0)
                    ).toLocaleString('ko-KR')}원)`}
                    description={`${Number(item?.pchs_avg_pric).toFixed(
                      2
                    )} > ${Number(item?.now_pric2).toFixed(2)} (${Number(
                      item?.ovrs_cblc_qty
                    ).toLocaleString('ko-KR')})`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              } else if (activeItem?.title === '미체결') {
                return (
                  <AsideItem
                    key={index}
                    title={`${item?.prdt_name} (${item?.pdno})`}
                    date={`${item?.sll_buy_dvsn_cd_name}`}
                    info={`${Number(item?.ft_ord_unpr3).toFixed(2)} (${
                      item?.ft_ccld_qty
                    } / ${item?.ft_ord_qty}) (${Number(
                      (
                        Number(item?.ft_ord_unpr3) *
                        Number(item?.ft_ord_qty) *
                        krw
                      ).toFixed(0)
                    ).toLocaleString('ko-KR')}원)`}
                    description={`${item?.prcs_stat_name}`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              } else if (activeItem?.title === '체결') {
                return (
                  <AsideItem
                    key={index}
                    title={`${item?.prdt_name} (${item?.pdno})`}
                    date={`${item?.sll_buy_dvsn_cd_name}`}
                    info={`${Number(item?.ft_ord_unpr3).toFixed(2)} (${
                      item?.ft_ccld_qty
                    } / ${item?.ft_ord_qty}) (${Number(
                      (
                        Number(item?.ft_ord_unpr3) *
                        Number(item?.ft_ord_qty) *
                        krw
                      ).toFixed(0)
                    ).toLocaleString('ko-KR')}원)`}
                    description={`${item?.prcs_stat_name}`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              } else if (activeItem?.title === '기간손익') {
                if (profitType === 'individual') {
                  return (
                    <AsideItem
                      key={index}
                      title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                      date={`${dayjs(item?.trad_day).format('YYYY-MM-DD')}`}
                      info={`${Number(item?.ovrs_rlzt_pfls_amt).toFixed(
                        2
                      )} (${Number(item?.pftrt).toFixed(2)})`}
                      description={`${Number(item?.pchs_avg_pric).toFixed(
                        2
                      )} > ${Number(item?.avg_sll_unpr).toFixed(2)}`}
                      onClick={() => setCurrent(index)}
                      active={current === index}
                    />
                  );
                } else if (profitType === 'daily') {
                  return (
                    <AsideItem
                      key={index}
                      title={dayjs(item?.trad_day).format('YYYY-MM-DD')}
                      date=""
                      info={
                        '손익 : ' +
                        Number(
                          Number(item?.totalProfit).toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원 ' +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        ).toFixed(2)}%)`
                      }
                      description={
                        '판매대금 : ' +
                        Number(
                          Number(item.totalInvestment).toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원'
                      }
                    />
                  );
                } else if (profitType === 'monthly') {
                  return (
                    <AsideItem
                      key={index}
                      title={dayjs(item?.yearMonth).format('YYYY년 MM월')}
                      date={`${item?.tradingDays?.length}일간`}
                      info={
                        '손익 : ' +
                        Number(
                          Number(item?.totalProfit).toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원 ' +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        ).toFixed(2)}%)`
                      }
                      description={
                        '판매대금 : ' +
                        Number(
                          Number(item.totalInvestment).toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원'
                      }
                    />
                  );
                }
              } else if (activeItem?.title === '분석') {
                return (
                  <AsideItem
                    key={item?.name}
                    title={`${item?.description} (${item?.name})`}
                    date={`${Number(item?.perf_1_m).toFixed(2)}%`}
                    info={`${item?.close} (${Number(item?.change).toFixed(
                      2
                    )}%)`}
                    description={`${Number(item?.perf_6_m).toFixed(
                      2
                    )}% > ${Number(item?.perf_3_m).toFixed(2)}% > ${Number(
                      item?.perf_1_m
                    ).toFixed(2)}% > ${Number(item?.perf_w).toFixed(2)}%`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              }
            })}
          </>
        )}
      </Aside>
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
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              if (current === list.length - 1) {
                setCurrent(0); // current를 0으로 초기화
                const nextIndex =
                  data.navMain.findIndex(
                    (item) => item.title === activeItem.title
                  ) + 1;
                const nextItem = data.navMain[nextIndex % data.navMain.length];
                setActiveItem(nextItem); // 다음 activeItem으로 이동
                handleMenuChange(nextItem);
              } else {
                setCurrent((prev) => Math.min(prev + 1, list.length - 1)); // 일반적인 증가
              }
            }}
          >
            <ArrowRight />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              {/* <Button variant="outline">Open</Button> */}
              <Button variant="ghost" size="icon" className="size-7">
                <Settings />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you&apos;re
                  done.
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Make changes to your account here. Click save when
                      you&apos;re done.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-name">Name</Label>
                      <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-username">Username</Label>
                      <Input id="tabs-demo-username" defaultValue="@peduarte" />
                    </div>
                  </CardContent>
                </TabsContent>
                <TabsContent value="password">
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password here. After saving, you&apos;ll be
                      logged out.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-current">
                        Current password
                      </Label>
                      <Input id="tabs-demo-current" type="password" />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="tabs-demo-new">New password</Label>
                      <Input id="tabs-demo-new" type="password" />
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
              <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </SectionHeader>

        <SectionTitle
          current={current}
          setCurrent={setCurrent}
          analysisData={list}
        >
          {list?.map((item, index) => {
            if (activeItem?.title === '잔고') {
              return (
                <SectionTitleItem
                  key={item?.ovrs_pdno}
                  title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                  date={`${item?.evlu_pfls_rt}%`}
                  info={`${Number(item?.frcr_pchs_amt1).toFixed(2)} > ${Number(
                    item?.ovrs_stck_evlu_amt
                  ).toFixed(2)} (${Number(
                    (Number(item?.frcr_evlu_pfls_amt) * krw).toFixed(0)
                  ).toLocaleString('ko-KR')}원)`}
                  description={`${Number(item?.pchs_avg_pric).toFixed(
                    2
                  )} > ${Number(item?.now_pric2).toFixed(2)} (${Number(
                    item?.ovrs_cblc_qty
                  ).toLocaleString('ko-KR')})`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '미체결') {
              return (
                <SectionTitleItem
                  key={index}
                  title={`${item?.prdt_name} (${item?.pdno})`}
                  date={`${item?.sll_buy_dvsn_cd_name}`}
                  info={`${Number(item?.ft_ord_unpr3).toFixed(2)} (${
                    item?.ft_ccld_qty
                  } / ${item?.ft_ord_qty}) (${(
                    Number(item?.ft_ord_unpr3) *
                    Number(item?.ft_ord_qty) *
                    krw
                  ).toLocaleString('ko-KR')}원)`}
                  description={`${item?.prcs_stat_name}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '체결') {
              return (
                <SectionTitleItem
                  key={index}
                  title={`${item?.prdt_name} (${item?.pdno})`}
                  date={`${item?.sll_buy_dvsn_cd_name}`}
                  info={`${Number(item?.ft_ord_unpr3).toFixed(2)} (${
                    item?.ft_ccld_qty
                  } / ${item?.ft_ord_qty}) (${(
                    Number(item?.ft_ord_unpr3) *
                    Number(item?.ft_ord_qty) *
                    krw
                  ).toLocaleString('ko-KR')}원)`}
                  description={`${item?.prcs_stat_name}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '기간손익') {
              return (
                <SectionTitleItem
                  key={index}
                  title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                  date={`${dayjs(item?.trad_day).format('YYYY-MM-DD')}`}
                  info={`${Number(item?.ovrs_rlzt_pfls_amt).toFixed(
                    2
                  )} (${Number(item?.pftrt).toFixed(2)})`}
                  description={`${Number(item?.pchs_avg_pric).toFixed(
                    2
                  )} > ${Number(item?.avg_sll_unpr).toFixed(2)}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '분석') {
              return (
                <SectionTitleItem
                  key={item?.name}
                  title={`${item?.description} (${item?.name})`}
                  date={`${Number(item?.perf_1_m).toFixed(2)}%`}
                  info={`${item?.close} (${Number(item?.change).toFixed(2)}%)`}
                  description={`${Number(item?.perf_6_m).toFixed(
                    2
                  )}% > ${Number(item?.perf_3_m).toFixed(2)}% > ${Number(
                    item?.perf_1_m
                  ).toFixed(2)}% > ${Number(item?.perf_w).toFixed(2)}%`}
                  active={current === index}
                />
              );
            }
          })}
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
                <CardDescription className="pt-1">
                  한국투자증권의 해외주식 기간별시세 기반의 데이터 입니다.
                </CardDescription>
                <Separator className="my-4" />
                <ChartAreaDefault
                  dailyPriceData={dailyPriceData}
                  onChange={handleChartChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="stock">
              <div className="py-2">
                <CardTitle>종목정보</CardTitle>
                <CardDescription className="pt-1">
                  한국투자증권의 해외주식 상품기본정보 기반의 데이터 입니다.
                </CardDescription>
                <Separator className="my-4" />
                <CardContent className="grid grid-cols-2 gap-4 px-0">
                  {/* 기본 정보 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>기본 정보</CardTitle>
                      <CardDescription>
                        종목의 표준상품번호, 영문명, 국가, 상품분류 등 기본적인
                        식별 정보를 제공합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>표준상품번호</Label>
                        <Input value={searchData?.std_pdno || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품영문명</Label>
                        <Input
                          value={searchData?.prdt_eng_name || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품명</Label>
                        <Input value={searchData?.prdt_name || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>국가명</Label>
                        <Input value={searchData?.natn_name || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>국가코드</Label>
                        <Input value={searchData?.natn_cd || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품분류명</Label>
                        <Input
                          value={searchData?.prdt_clsf_name || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품분류코드</Label>
                        <Input
                          value={searchData?.prdt_clsf_cd || ''}
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 거래 정보 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>거래 정보</CardTitle>
                      <CardDescription>
                        거래시장, 거래소, 통화, 단위 등 실제 매매와 관련된 거래
                        조건 정보를 확인할 수 있습니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>거래시장명</Label>
                        <Input
                          value={searchData?.tr_mket_name || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래시장코드</Label>
                        <Input value={searchData?.tr_mket_cd || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외거래소명</Label>
                        <Input
                          value={searchData?.ovrs_excg_name || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외거래소코드</Label>
                        <Input
                          value={searchData?.ovrs_excg_cd || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래통화코드</Label>
                        <Input value={searchData?.tr_crcy_cd || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>통화명</Label>
                        <Input value={searchData?.crcy_name || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외액면가</Label>
                        <Input value={searchData?.ovrs_papr || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>매수단위수량</Label>
                        <Input
                          value={searchData?.buy_unit_qty || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>매도단위수량</Label>
                        <Input
                          value={searchData?.sll_unit_qty || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래단위금액</Label>
                        <Input value={searchData?.tr_unit_amt || ''} readOnly />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 상장/상태 정보 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>상장/상태 정보</CardTitle>
                      <CardDescription>
                        상장주식수, 상장일자, 상장여부, 폐지여부 등 종목의 상장
                        및 상태 관련 정보를 보여줍니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>상장주식수</Label>
                        <Input
                          value={searchData?.lstg_stck_num || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장일자</Label>
                        <Input value={searchData?.lstg_dt || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장여부</Label>
                        <Input value={searchData?.lstg_yn || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장폐지종목여부</Label>
                        <Input
                          value={searchData?.lstg_abol_item_yn || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장폐지일자</Label>
                        <Input
                          value={searchData?.lstg_abol_dt || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식거래정지구분코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_tr_stop_dvsn_cd || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식상품그룹번호</Label>
                        <Input
                          value={searchData?.ovrs_stck_prdt_grp_no || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식등록사유코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_erlm_rosn_cd || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식이력권리구분코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_hist_rght_dvsn_cd || ''}
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기타 정보 */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>기타 정보</CardTitle>
                      <CardDescription>
                        현재가, SEDOL, 블룸버그티커, 메모 등 기타 참고용 부가
                        정보를 제공합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>현재가</Label>
                        <Input
                          value={searchData?.ovrs_now_pric1 || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>최종수신일시</Label>
                        <Input
                          value={searchData?.last_rcvg_dtime || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>SEDOL번호</Label>
                        <Input value={searchData?.sedol_no || ''} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>블룸버그티커</Label>
                        <Input
                          value={searchData?.blbg_tckr_text || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>기관용도ISIN코드</Label>
                        <Input
                          value={searchData?.istt_usge_isin_cd || ''}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>메모</Label>
                        <Input value={searchData?.memo_text1 || ''} readOnly />
                      </div>
                      {/* 필요시 추가 필드 계속 추가 */}
                    </CardContent>
                  </Card>
                </CardContent>
              </div>
            </TabsContent>
            <TabsContent value="news">
              <div className="py-2">
                <CardTitle>뉴스</CardTitle>
                <CardDescription className="pt-1">
                  최신 뉴스 목록입니다.
                </CardDescription>
                <Separator className="my-4" />
                <div className="grid gap-4">
                  {newsData?.news.map((newsItem) => (
                    <Card key={newsItem.id} className="flex flex-col">
                      <CardHeader className="flex gap-4">
                        <img
                          src={newsItem.imageUrls[0]}
                          alt={newsItem.title}
                          className="w-16 h-16 rounded-md object-cover shrink-0"
                        />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <img
                              src={newsItem.source.faviconUrl}
                              alt={newsItem.source.name}
                              className="w-5 h-5"
                            />
                            {newsItem.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {newsItem.contentText}
                          </CardDescription>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(newsItem.createdAt).toLocaleDateString(
                            'ko-KR',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community">
              <div className="py-2">
                <CardTitle>커뮤니티</CardTitle>
                <CardDescription className="pt-1">
                  최신 커뮤니티 글입니다.
                </CardDescription>
                <Separator className="my-4" />
                <div className="flex flex-col gap-4">
                  {newsData?.comments.map((comment) => (
                    <Card
                      key={comment.id}
                      className="flex flex-row items-start px-4 gap-4"
                    >
                      <img
                        src={comment.author.profilePictureUrl}
                        alt={comment.author.nickname}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comment.author.nickname}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {dayjs(comment.createdAt).format(
                              'YYYY-MM-DD HH:mm'
                            )}
                          </span>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </PageWrap>
  );
}
