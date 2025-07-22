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
  Play,
  RotateCw,
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

import { Toaster } from 'sonner';

import useToken from '@/hooks/useToken'; // 토큰 유효성 검사 훅

import useAnalysis from './hooks/useAnalysis'; // 분석 데이터 훅
import useHolding from './hooks/useHolding'; // 보유 종목 데이터 훅
import useCnnl from './hooks/useCnnl'; // 체결 데이터 훅
import useProfit from './hooks/useProfit'; // 기간 손익 데이터 훅

import useGemini from './hooks/useGemini'; // 제미니 관련 훅
import useGeminiNews from './hooks/useGeminiNews'; // 제미니 뉴스 훅
import useGeminiTechnical from './hooks/useGeminiTechnical'; // 제미니 기술적 분석 훅
import useGeminiFinancial from './hooks/useGeminiFinancial'; // 제미니 재무 데이터 훅

import useSearchInfo from './hooks/useSearchInfo'; // 현재가 상세 정보 훅
import useDailyprice from './hooks/useDailyprice'; // 기간별 시세 훅
import usePriceDetail from './hooks/usePriceDetail'; // 현제가 상세 훅
import useNewsCommunity from './hooks/useNewsCommunity'; // 뉴스 및 커뮤니티 훅
import useExchangeRate from './hooks/useExchangeRate'; // 환율 훅

import useBuy from './hooks/useBuy'; // 매수 훅

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
import Buy from './components/Buy';

import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import { getLogoUrlByCode, getLogoUrlById } from '../page/log/utils/logoUtils';
import { DividendAnalysis } from './components/DividendAnalysis';
import { CashFlowAnalysis } from './components/CashFlowAnalysis';

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

  // 매매
  const { mutation } = useBuy();

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
  const {
    data: geminiData,
    mutate: fetchGeminiData,
    isPending: geminiPending,
  } = useGemini(); // 제미니 관련 훅
  const {
    data: geminiNewsData,
    mutate: fetchGeminiNewsData,
    isPending: geminiNewsPending,
  } = useGeminiNews(120000); // 뉴스 데이터
  const {
    data: geminiTechnicalData,
    mutate: fetchGeminiTechnicalData,
    isPending: geminiTechnicalPending,
  } = useGeminiTechnical(120000); // 기술적 분석 데이터
  const {
    data: geminiFinancialData,
    mutate: fetchGeminiFinancialData,
    isPending: geminiFinancialPending,
  } = useGeminiFinancial(120000); // 재무 데이터

  const { data: newsData, mutate: fetchNews } = useNewsCommunity(); // 뉴스 및 커뮤니티
  const { data: searchData, mutate: fetchSearchInfo } = useSearchInfo(); // 상품기본정보
  const { data: dailyPriceData, mutate: fetchDailyPrice } = useDailyprice(); // 기간별시세
  const {
    data: priceDetailData,
    mutate: fetchPriceDetail,
    isError,
  } = usePriceDetail(); // 현제가 상세
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

  // 현재 종목 분석 데이터
  const currentAnalysisData = useMemo(() => {
    const currentItem = list[current];
    const code = currentItem?.[KEY_MAP[activeItem?.title]];
    return analysisData.find((item) => item.name === code);
  }, [analysisData, current]);

  const handleMenuChange = (newActive) => {
    setActiveItem(newActive);
    switch (newActive?.title) {
      case '잔고':
        setList(
          holdingData.map((item) => ({
            ...item,
            isCnnl: cnnlData?.some(
              (cnnlItem) => cnnlItem?.pdno === item.ovrs_pdno
            ),
            isNotCnnl: cnnlData
              ?.filter((item) => item?.prcs_stat_name !== '완료')
              .some((cnnlItem) => cnnlItem?.pdno === item.ovrs_pdno),
          }))
        );
        break;
      case '미체결':
        setList(cnnlData?.filter((item) => item?.prcs_stat_name !== '완료'));
        break;
      case '분석':
        console.log('analysisData[0]', analysisData[0]);

        setList(
          analysisData
            // .filter((item) => item?.예측결과 >= 0.6)
            // .filter((item) => item?.close !== undefined && item?.close >= 3)
            // .filter((item) => Number(item?.perf_1_m) <= 0)
            .map((item) => {
              return {
                ...item,
                isHolding: holdingData?.some(
                  (holdingItem) => holdingItem?.ovrs_pdno === item.name
                ),
                isCnnl: cnnlData?.some(
                  (cnnlItem) => cnnlItem?.pdno === item.name
                ),
              };
            })
        );
        break;
      case '체결':
        setList(cnnlData?.filter((item) => item?.prcs_stat_name === '완료'));
        break;
      case '기간손익':
        setList(profitData);
        break;
      default:
        setList([]);
    }
  };

  const dataInitialized = useRef(false);
  const asideScrollContainerRef = useRef(null); // 스크롤 컨테이너 Ref 추가

  // current 값이 변경될 때 스크롤 이동
  useEffect(() => {
    console.log('useEffect current');
    if (asideScrollContainerRef.current) {
      console.log('useEffect current asideScrollContainerRef.current');
      const activeItemElement = asideScrollContainerRef.current.querySelector(
        `[data-index="${current}"]`
      );
      console.log('useEffect current activeItemElement');
      if (activeItemElement) {
        console.log('useEffect current activeItemElement 2');
        activeItemElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        console.log('activeItemElement.scrollIntoView');
      }
    }
  }, [current]);

  useEffect(() => {
    // 환율은 한 번만 가져오도록 설정
    fetchExchangeRate();

    // 기간손익도 한 번만 가져오도록 설정
    //fetchProfitData();
  }, []);

  // 처음에 기본값? 셋팅
  useEffect(() => {
    // Only set the list once when holdingData is first available
    if (holdingData && holdingData.length > 0 && !dataInitialized.current) {
      setList(holdingData);
      //getDetailData(0);
      dataInitialized.current = true;
    }
  }, [holdingData]);

  useEffect(() => {
    getDetailData(current);
  }, [current, list]);

  // 디테일 데이터 가져오기
  const getDetailData = (index) => {
    const newItem = list?.[index];
    const code = newItem?.[KEY_MAP[activeItem?.title]];
    if (!code) {
      if (autoPlay) {
        next();
      }
      return; // 코드가 없으면 아무 작업도 하지 않음
    }
    fetchSearchInfo({
      PDNO: code,
    });
    fetchDailyPrice({
      SYMB: code,
    });
    fetchPriceDetail({
      SYMB: code,
    });
    fetchNews({
      code: code,
    });
    //if (!autoPlay) {
    // fetchGeminiData({
    //   code: code,
    // });
    // fetchGeminiNewsData({
    //   code: code,
    // });
    // console.log("currentAnalysisData", currentAnalysisData);
    // fetchGeminiTechnicalData({
    //   ticker: code,
    //   technicalData: {
    //     "Recommend.All": currentAnalysisData?.recommend_all,
    //     "Recommend.MA": currentAnalysisData?.recommend_m_a,
    //     "Recommend.Other": currentAnalysisData?.recommend_other,
    //     RSI: currentAnalysisData?.r_s_i,
    //     Mom: currentAnalysisData?.mom,
    //     AO: currentAnalysisData?.a_o,
    //     CCI20: currentAnalysisData?.c_c_i20,
    //     "Stoch.K": currentAnalysisData?.stoch_k,
    //     "Stoch.D": currentAnalysisData?.stoch_d,
    //     pricescale: currentAnalysisData?.pricescale,
    //   },
    // });
    // fetchGeminiFinancialData({
    //   code: code,
    // });
    //}
  };

  // 4개 분석이 모두 완료되었는지 확인하는 함수
  // const isAllAnalysisCompleted = () => {
  //   return (
  //     geminiData &&
  //     geminiNewsData &&
  //     geminiTechnicalData &&
  //     geminiFinancialData &&
  //     !geminiPending &&
  //     !geminiNewsPending &&
  //     !geminiTechnicalPending &&
  //     !geminiFinancialPending
  //   );
  // };

  // 4개 분석 완료 시 실행되는 useEffect
  useEffect(() => {
    // if (!isAllAnalysisCompleted()) {
    //   return;
    // }

    let timeoutId;

    const currentItem = list[current];
    const code = currentItem?.[KEY_MAP[activeItem?.title]];
    // 분석데이터
    const analysisItem = analysisData.find((item) => item.name === code);

    // 각 분석 데이터에서 점수 추출
    const newsScore = geminiNewsData?.overallSentiment?.score || 0;
    const expertScore = geminiData?.summary?.averageScore || 0;
    const technicalScore =
      geminiTechnicalData?.technicalScore?.overallScore || 0;
    const financialScore = geminiFinancialData?.financialHealth?.overallScore
      ? (geminiFinancialData.financialHealth.overallScore / 10) * 5
      : 0; // 10점 척도를 5점 척도로 변환

    // 현재가 상세의 isError 를 보고 정상 조회가 되었을때만 mutation 실행
    if (!isError)
      mutation({
        currentItem, // 현재 데이터
        priceDetailData, // 현재가 상세
        analysisItem, // 분석 데이터
        menu: activeItem.title, // 현재 메뉴
        newsScore, // 뉴스분석 점수 (1-5)
        expertScore, // 전문가 분석 점수 (1-5)
        technicalScore, // 기술적 분석 점수 (1-5)
        financialScore, // 재무 분석 점수 (1-5로 변환)
      });

    if (autoPlay) {
      timeoutId = setTimeout(next, 2000);
    }

    // 클린업 함수로 이전 타이머 취소
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    geminiData,
    geminiNewsData,
    geminiTechnicalData,
    geminiFinancialData,
    geminiPending,
    geminiNewsPending,
    geminiTechnicalPending,
    geminiFinancialPending,
  ]);

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

  const next = () => {
    if (current === list.length - 1) {
      setCurrent(0); // current를 0으로 초기화

      // 기간손익을 제외한 메뉴만 필터링
      const availableMenus = data.navMain.filter(
        (item) => !['기간손익', '체결'].includes(item.title)
      );

      const currentIndex = availableMenus.findIndex(
        (item) => item.title === activeItem.title
      );
      const nextIndex = (currentIndex + 1) % availableMenus.length;
      const nextItem = availableMenus[nextIndex];

      setActiveItem(nextItem); // 다음 activeItem으로 이동
      handleMenuChange(nextItem);
    } else {
      setCurrent((prev) => Math.min(prev + 1, list.length - 1)); // 일반적인 증가
    }
  };

  // 제미니 로딩 관련 상태 추가
  const [geminiProgress, setGeminiProgress] = useState(0);
  const [geminiStartTime, setGeminiStartTime] = useState(null);
  const [geminiElapsedTime, setGeminiElapsedTime] = useState(0);

  // 제미니 진행률 및 경과 시간 관리
  useEffect(() => {
    if (geminiPending && !geminiStartTime) {
      // 로딩 시작
      setGeminiStartTime(Date.now());
      setGeminiProgress(0);
      setGeminiElapsedTime(0);
    } else if (!geminiPending && geminiStartTime) {
      // 로딩 완료
      setGeminiStartTime(null);
      setGeminiProgress(0);
      setGeminiElapsedTime(0);
    }
  }, [geminiPending, geminiStartTime]);

  // 진행률 바 애니메이션 및 경과 시간 업데이트
  useEffect(() => {
    let interval;

    if (geminiPending && geminiStartTime) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - geminiStartTime) / 1000; // 초 단위
        setGeminiElapsedTime(elapsed);

        // 35초를 기준으로 진행률 계산 (최대 99%까지만)
        const progress = Math.min((elapsed / 35) * 99, 99);
        setGeminiProgress(progress);
      }, 100); // 100ms마다 업데이트
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [geminiPending, geminiStartTime]);

  // 경과 시간을 분:초 형식으로 포맷
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 35);
    const secs = Math.floor(seconds % 35);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageWrap>
      <Header
        data={data}
        activeItem={activeItem}
        onChange={(item) => handleMenuChange(item)}
      />
      <Aside
        ref={asideScrollContainerRef}
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
                    Number(totalProfit?.totalProfit)?.toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
                (
                {(
                  (Number(totalProfit?.totalProfit) /
                    Number(totalProfit?.totalInvestment)) *
                  100
                )?.toFixed(1)}
                %)
              </div>
            </div>
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">총 매매금액</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(totalProfit?.totalInvestment)?.toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeItem?.title === '잔고' && (
          <div className="flex">
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">평가금액</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.tot_evlu_pfls_amt * krw)?.toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">평가손익</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.ovrs_tot_pfls * krw)?.toFixed(0)
                  ).toLocaleString('ko-KR')}
                </div>
                ({Number(holdingData2?.tot_pftrt)?.toFixed(1)}
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
                    key={index}
                    data-index={index}
                    logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                    title={`${item?.ovrs_pdno} ${item?.ovrs_item_name}`}
                    date={`${item?.evlu_pfls_rt}%`}
                    info={`${Number(
                      (Number(item?.frcr_evlu_pfls_amt) * krw)?.toFixed(0)
                    ).toLocaleString('ko-KR')}원`}
                    // description={`${Number(item?.pchs_avg_pric)?.toFixed(
                    //   2
                    // )} > ${Number(item?.now_pric2)?.toFixed(2)} (${Number(
                    //   item?.ovrs_cblc_qty
                    // ).toLocaleString("ko-KR")})`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                    badge={[false, item?.isCnnl, item?.isNotCnnl]}
                  />
                );
              } else if (activeItem?.title === '미체결') {
                return (
                  <AsideItem
                    key={index}
                    data-index={index}
                    logoUrl={getLogoUrlByCode(item?.pdno)}
                    title={`${item?.prdt_name} (${item?.pdno})`}
                    date={`${item?.sll_buy_dvsn_cd_name}`}
                    info={`${Number(item?.ft_ord_unpr3)?.toFixed(2)} (${
                      item?.ft_ccld_qty
                    } / ${item?.ft_ord_qty}) (${Number(
                      (
                        Number(item?.ft_ord_unpr3) *
                        Number(item?.ft_ord_qty) *
                        krw
                      )?.toFixed(0)
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
                    data-index={index}
                    logoUrl={getLogoUrlByCode(item?.pdno)}
                    title={`${item?.prdt_name} (${item?.pdno})`}
                    date={`${item?.sll_buy_dvsn_cd_name}`}
                    info={`${Number(item?.ft_ord_unpr3)?.toFixed(2)} (${
                      item?.ft_ccld_qty
                    } / ${item?.ft_ord_qty}) (${Number(
                      (
                        Number(item?.ft_ord_unpr3) *
                        Number(item?.ft_ord_qty) *
                        krw
                      )?.toFixed(0)
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
                      data-index={index}
                      logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                      title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                      date={`${dayjs(item?.trad_day).format('YYYY-MM-DD')}`}
                      info={`${Number(
                        Number(item?.ovrs_rlzt_pfls_amt)?.toFixed(0)
                      ).toLocaleString('ko-KR')}원 (${Number(
                        item?.pftrt
                      )?.toFixed(2)})`}
                      description={`${Number(item?.pchs_avg_pric)?.toFixed(
                        2
                      )} > ${Number(item?.avg_sll_unpr)?.toFixed(2)}`}
                      onClick={() => setCurrent(index)}
                      active={current === index}
                    />
                  );
                } else if (profitType === 'daily') {
                  return (
                    <AsideItem
                      key={index}
                      data-index={index}
                      title={dayjs(item?.trad_day).format('YYYY-MM-DD')}
                      date=""
                      info={
                        '손익 : ' +
                        Number(
                          Number(item?.totalProfit)?.toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원 ' +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        )?.toFixed(2)}%)`
                      }
                      description={
                        '판매대금 : ' +
                        Number(
                          Number(item.totalInvestment)?.toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원'
                      }
                    />
                  );
                } else if (profitType === 'monthly') {
                  return (
                    <AsideItem
                      key={index}
                      data-index={index}
                      title={dayjs(item?.yearMonth).format('YYYY년 MM월')}
                      date={`${item?.tradingDays?.length}일간`}
                      info={
                        '손익 : ' +
                        Number(
                          Number(item?.totalProfit)?.toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원 ' +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        )?.toFixed(2)}%)`
                      }
                      description={
                        '판매대금 : ' +
                        Number(
                          Number(item.totalInvestment)?.toFixed(0)
                        ).toLocaleString('ko-KR') +
                        '원'
                      }
                    />
                  );
                }
              } else if (activeItem?.title === '분석') {
                return (
                  <AsideItem
                    key={index}
                    data-index={index}
                    logoUrl={getLogoUrlById(item?.logoid)}
                    title={`${item?.description} (${item?.name})`}
                    date={`${Number(item?.perf_1_m)?.toFixed(2)}%`}
                    info={`${item?.close} (${Number(item?.change)?.toFixed(
                      2
                    )}%)`}
                    // description={`${Number(item?.perf_6_m)?.toFixed(
                    //   2
                    // )}% > ${Number(item?.perf_3_m)?.toFixed(2)}% > ${Number(
                    //   item?.perf_1_m
                    // )?.toFixed(2)}% > ${Number(item?.perf_w)?.toFixed(2)}%`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                    badge={[item.isHolding, item.isCnnl, null, item.예측결과]}
                  />
                );
              }
            })}
          </>
        )}
      </Aside>
      <Main>
        <Toaster />
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
          <Button variant="ghost" size="icon" className="size-7" onClick={next}>
            <ArrowRight />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => toggleAutoPlay(!autoPlay)}
          >
            {autoPlay ? <RotateCw className="animate-spin" /> : <Play />}
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
                  key={index}
                  logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                  title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                  date={`${item?.evlu_pfls_rt}%`}
                  info={`${Number(item?.frcr_pchs_amt1)?.toFixed(2)} > ${Number(
                    item?.ovrs_stck_evlu_amt
                  )?.toFixed(2)} (${Number(
                    (Number(item?.frcr_evlu_pfls_amt) * krw)?.toFixed(0)
                  ).toLocaleString('ko-KR')}원)`}
                  description={`${Number(item?.pchs_avg_pric)?.toFixed(
                    2
                  )} > ${Number(item?.now_pric2)?.toFixed(2)} (${Number(
                    item?.ovrs_cblc_qty
                  ).toLocaleString('ko-KR')})`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '미체결') {
              return (
                <SectionTitleItem
                  key={index}
                  logoUrl={getLogoUrlByCode(item?.pdno)}
                  title={`${item?.prdt_name} (${item?.pdno})`}
                  date={`${item?.sll_buy_dvsn_cd_name}`}
                  info={`${Number(item?.ft_ord_unpr3)?.toFixed(2)} (${
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
                  logoUrl={getLogoUrlByCode(item?.pdno)}
                  title={`${item?.prdt_name} (${item?.pdno})`}
                  date={`${item?.sll_buy_dvsn_cd_name}`}
                  info={`${Number(item?.ft_ord_unpr3)?.toFixed(2)} (${
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
                  logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                  title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                  date={`${dayjs(item?.trad_day).format('YYYY-MM-DD')}`}
                  info={`${Number(item?.ovrs_rlzt_pfls_amt)?.toFixed(
                    0
                  )}원 (${Number(item?.pftrt)?.toFixed(2)})`}
                  description={`${Number(item?.pchs_avg_pric)?.toFixed(
                    2
                  )} > ${Number(item?.avg_sll_unpr)?.toFixed(2)}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === '분석') {
              return (
                <SectionTitleItem
                  key={index}
                  logoUrl={getLogoUrlById(item?.logoid)}
                  title={`${item?.description} (${item?.name})`}
                  date={`${Number(item?.perf_1_m)?.toFixed(2)}%`}
                  info={`${item?.close} (${Number(item?.change)?.toFixed(2)}%)`}
                  description={`${Number(item?.perf_6_m)?.toFixed(
                    2
                  )}% > ${Number(item?.perf_3_m)?.toFixed(2)}% > ${Number(
                    item?.perf_1_m
                  )?.toFixed(2)}% > ${Number(item?.perf_w)?.toFixed(2)}%`}
                  active={current === index}
                  badge={[item.isHolding, item.isCnnl, item.예측결과]}
                />
              );
            }
          })}
        </SectionTitle>
        <Separator className="mr-2 h-4" />
        <div className="h-full overflow-y-scroll flex flex-col gap-4 p-4 scrollbar-hide">
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="dividendAnalysis">배당 분석</TabsTrigger>
              {/* 현금흐름 분석 */}
              <TabsTrigger value="cashFlowAnalysis">현금흐름 분석</TabsTrigger>
              <TabsTrigger value="gemini">전문가 분석</TabsTrigger>
              <TabsTrigger value="geminiNews">뉴스 분석</TabsTrigger>
              <TabsTrigger value="geminiTech">기술 분석</TabsTrigger>
              <TabsTrigger value="geminiFinance">재무 분석</TabsTrigger>
              <TabsTrigger value="chart">차트</TabsTrigger>
              <TabsTrigger value="stock">종목정보</TabsTrigger>
              <TabsTrigger value="news">뉴스</TabsTrigger>
              <TabsTrigger value="community">커뮤니티</TabsTrigger>
              <TabsTrigger value="order">주문</TabsTrigger>
            </TabsList>
            <TabsContent value="dividendAnalysis">
              <DividendAnalysis data={currentAnalysisData?.dividend} />
            </TabsContent>
            <TabsContent value="cashFlowAnalysis">
              <CashFlowAnalysis data={currentAnalysisData?.cashFlow} />
            </TabsContent>
            <TabsContent value="gemini">
              <div className="py-2">
                <CardTitle>전문가 분석</CardTitle>
                <CardDescription className="pt-1">
                  제미니 AI 기반의 종목 분석 데이터 입니다.
                </CardDescription>
                <Separator className="my-4" />
                {geminiPending ? (
                  <div className="space-y-6">
                    {/* 진행 상황 표시 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RotateCw
                            className="animate-spin text-blue-500"
                            size={20}
                          />
                          AI 분석 진행 중...
                        </CardTitle>
                        <CardDescription>
                          9개 주요 금융 사이트를 실시간으로 분석하고 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* 진행률 바 */}
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                              style={{
                                width: `${geminiProgress}%`,
                              }}
                            ></div>
                          </div>

                          {/* 진행률 및 시간 정보 */}
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{Math.round(geminiProgress)}% 완료</span>
                            <span>
                              경과 시간: {formatElapsedTime(geminiElapsedTime)}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground text-center">
                            평균 소요 시간: 약 35초
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 분석 사이트 목록 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>분석 중인 사이트</CardTitle>
                        <CardDescription>
                          다음 사이트들의 데이터를 수집하고 분석합니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { name: 'MarketBeat', status: 'analyzing' },
                            { name: 'Barchart', status: 'analyzing' },
                            { name: 'TipRanks', status: 'analyzing' },
                            { name: 'Zacks', status: 'analyzing' },
                            { name: 'Yahoo Finance', status: 'analyzing' },
                            { name: 'Seeking Alpha', status: 'analyzing' },
                            { name: 'Simply Wall St', status: 'analyzing' },
                            { name: 'MarketWatch', status: 'analyzing' },
                            { name: 'TradingView', status: 'analyzing' },
                          ].map((site, index) => (
                            <div
                              key={site.name}
                              className="flex items-center gap-2 p-2 border rounded"
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  site.status === 'analyzing'
                                    ? 'bg-yellow-500 animate-pulse'
                                    : 'bg-green-500'
                                }`}
                              ></div>
                              <span className="text-sm">{site.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 분석 과정 설명 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>분석 과정</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            {
                              step: '1',
                              title: '데이터 수집',
                              desc: '각 사이트에서 최신 분석 데이터 수집',
                              status: 'progress',
                            },
                            {
                              step: '2',
                              title: 'AI 분석',
                              desc: '제미니 AI가 수집된 데이터를 종합 분석',
                              status: 'progress',
                            },
                            {
                              step: '3',
                              title: '점수 산정',
                              desc: '1-10점 척도로 투자 의견 점수화',
                              status: 'waiting',
                            },
                            {
                              step: '4',
                              title: '결과 생성',
                              desc: '한국어 분석 리포트 생성',
                              status: 'waiting',
                            },
                          ].map((process) => (
                            <div
                              key={process.step}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  process.status === 'progress'
                                    ? 'bg-blue-500 text-white animate-pulse'
                                    : process.status === 'complete'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {process.step}
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">
                                  {process.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {process.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 재미있는 팁 */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardHeader>
                        <CardTitle className="text-blue-700">
                          💡 분석 중 알아두면 좋은 팁
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p>
                            • <strong>MarketBeat</strong>: 애널리스트 컨센서스
                            중심의 분석
                          </p>
                          <p>
                            • <strong>TradingView</strong>: 기술적 분석 및 차트
                            패턴
                          </p>
                          <p>
                            • <strong>Zacks Rank</strong>: 실적 추정치 변화 기반
                            평가
                          </p>
                          <p>
                            • <strong>Simply Wall St</strong>: 장기 펀더멘털
                            가치 평가
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiData && !geminiData.error ? (
                  <div className="space-y-6">
                    {/* 종목 기본 정보 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {geminiData.companyName} ({geminiData.ticker})
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {geminiData.requestDate}
                          </span>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* 종합 평가 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>종합 평가</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* 평균 점수 */}
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold">
                              {geminiData.summary.averageScore}/5
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${
                                      (geminiData.summary.averageScore / 5) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {geminiData.summary.averageScore >= 5
                                ? '강력 매수'
                                : geminiData.summary.averageScore >= 4
                                ? '매수'
                                : geminiData.summary.averageScore >= 3
                                ? '중립'
                                : geminiData.summary.averageScore >= 2
                                ? '매도'
                                : '강력 매도'}
                            </div>
                          </div>

                          {/* 목표주가 및 전문가 수 정보 추가 */}
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                분석한 전문가 수
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {geminiData.summary.totalAnalysts}명
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                평균 목표주가
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {geminiData.summary.averageTargetPrice || 'N/A'}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                현재가 대비
                              </div>
                              <div className="text-lg font-bold text-purple-600">
                                {geminiData.summary.targetPriceUpside || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* 점수 의미 */}
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            {Object.entries(
                              geminiData.summary.scoreMeaning
                            ).map(([range, meaning]) => (
                              <div
                                key={range}
                                className="text-center p-2 bg-gray-50 rounded"
                              >
                                <div className="font-medium">{range}점</div>
                                <div className="text-muted-foreground">
                                  {meaning}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 결론 */}
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium mb-2">분석 결론</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {geminiData.summary.conclusion_kr}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 사이트별 분석 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>사이트별 분석</CardTitle>
                        <CardDescription>
                          주요 금융 정보 사이트별 투자 의견 및 점수
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {geminiData.analysisBySource.map(
                            (analysis, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-medium">
                                      {analysis.source}
                                    </h4>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        analysis?.score >= 4
                                          ? 'bg-green-100 text-green-800'
                                          : analysis?.score >= 3
                                          ? 'bg-blue-100 text-blue-800'
                                          : analysis.score >= 2
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {analysis.ratingText}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold">
                                      {analysis?.score}/5
                                    </span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          analysis?.score >= 4
                                            ? 'bg-green-500'
                                            : analysis?.score >= 3
                                            ? 'bg-blue-500'
                                            : analysis?.score >= 2
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                        }`}
                                        style={{
                                          width: `${
                                            (analysis?.score / 5) * 100
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {/* 목표주가 및 전문가 수 추가 */}
                                <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-gray-50 rounded">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      목표주가:
                                    </span>
                                    <span className="text-sm font-medium text-green-600">
                                      {analysis.targetPrice || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      분석가 수:
                                    </span>
                                    <span className="text-sm font-medium text-blue-600">
                                      {analysis.analystCount || 0}명
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                  {analysis.summary_kr}
                                </p>

                                <a
                                  href={analysis.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  원문 보기 →
                                </a>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiData && geminiData.error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center max-w-md">
                      <div className="text-red-600 font-medium mb-2">
                        전문가 분석 오류
                      </div>
                      <div className="text-sm text-red-500 mb-4">
                        {geminiData.message ||
                          '전문가 분석 중 오류가 발생했습니다.'}
                      </div>
                      <div className="text-xs text-gray-500">
                        잠시 후 다시 시도해주세요.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <div className="text-sm">
                      제미니 분석을 시작하려면 종목을 선택하세요.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="geminiNews">
              <div className="py-2">
                <CardTitle>뉴스 분석</CardTitle>
                <CardDescription className="pt-1">
                  제미니 AI 기반의 최신 뉴스 분석 데이터입니다.
                </CardDescription>
                <Separator className="my-4" />
                {geminiNewsPending ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RotateCw
                            className="animate-spin text-green-500"
                            size={20}
                          />
                          뉴스 분석 진행 중...
                        </CardTitle>
                        <CardDescription>
                          최신 뉴스를 수집하고 감정 분석을 수행하고 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            뉴스 수집 및 감정 분석 중...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiNewsData && !geminiNewsData.error ? (
                  <div className="space-y-6">
                    {/* 종목 기본 정보 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {geminiNewsData.companyName} (
                            {geminiNewsData.ticker})
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {geminiNewsData.analysisDate}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          분석 기간: {geminiNewsData.analysisperiod}
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {/* 전반적 감정 분석 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>종합 뉴스 감정</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold">
                              {geminiNewsData.overallSentiment?.score}/5
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    geminiNewsData.overallSentiment?.score >= 4
                                      ? 'bg-green-600'
                                      : geminiNewsData.overallSentiment
                                          ?.score >= 3
                                      ? 'bg-blue-600'
                                      : 'bg-red-600'
                                  }`}
                                  style={{
                                    width: `${
                                      (geminiNewsData.overallSentiment?.score /
                                        5) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {geminiNewsData.overallSentiment?.rating}
                            </div>
                          </div>

                          {/* 데이터 가용성 */}
                          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                뉴스 개수
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {geminiNewsData.dataAvailability?.newsCount}개
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                데이터 소스
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {
                                  geminiNewsData.dataAvailability
                                    ?.sourcesWithData.length
                                }
                                개
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                데이터 충분성
                              </div>
                              <div className="text-lg font-bold text-purple-600">
                                {geminiNewsData.dataAvailability?.coverage}
                              </div>
                            </div>
                          </div>

                          {/* 감정 점수 의미 */}
                          {/* <div className="grid grid-cols-5 gap-2 text-xs">
                            {Object.entries(
                              geminiNewsData?.overallSentiment?.scoreMeaning
                            )?.map(([score, meaning]) => (
                              <div
                                key={score}
                                className="text-center p-2 bg-gray-50 rounded"
                              >
                                <div className="font-medium">{score}점</div>
                                <div className="text-muted-foreground">
                                  {meaning}
                                </div>
                              </div>
                            ))}
                          </div> */}

                          {/* 주요 요인 */}
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium mb-2">주요 영향 요인</h4>
                            <ul className="space-y-1">
                              {geminiNewsData.overallSentiment?.keyFactors.map(
                                (factor, index) => (
                                  <li
                                    key={index}
                                    className="text-sm flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    {factor}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          {/* 종합 요약 */}
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium mb-2">종합 분석</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {geminiNewsData.overallSentiment?.summary_kr}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 개별 뉴스 분석 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>개별 뉴스 분석</CardTitle>
                        <CardDescription>
                          최근 뉴스별 감정 분석 결과
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {geminiNewsData?.newsAnalysis?.map((news, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      {news.date}
                                    </span>
                                    <span className="text-sm font-medium text-blue-600">
                                      {news.source}
                                    </span>
                                  </div>
                                  <h4 className="font-medium text-sm mb-2">
                                    {news.headline}
                                  </h4>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    news.sentiment.includes('긍정')
                                      ? 'bg-green-100 text-green-800'
                                      : news.sentiment.includes('부정')
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {news.sentiment}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {news.impact}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiNewsData && geminiNewsData.error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center max-w-md">
                      <div className="text-red-600 font-medium mb-2">
                        뉴스 분석 오류
                      </div>
                      <div className="text-sm text-red-500 mb-4">
                        {geminiNewsData.message ||
                          '뉴스 분석 중 오류가 발생했습니다.'}
                      </div>
                      <div className="text-xs text-gray-500">
                        잠시 후 다시 시도해주세요.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <div className="text-sm">
                      뉴스 분석을 시작하려면 종목을 선택하세요.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="geminiTech">
              <div className="py-2">
                <CardTitle>기술 분석</CardTitle>
                <CardDescription className="pt-1">
                  제미니 AI 기반의 기술적 지표 분석 데이터입니다.
                </CardDescription>
                <Separator className="my-4" />
                {geminiTechnicalPending ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RotateCw
                            className="animate-spin text-purple-500"
                            size={20}
                          />
                          기술적 분석 진행 중...
                        </CardTitle>
                        <CardDescription>
                          기술적 지표를 분석하고 매매 신호를 생성하고 있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            기술적 지표 분석 중...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiTechnicalData && !geminiTechnicalData.error ? (
                  <div className="space-y-6">
                    {/* 종목 기본 정보 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {geminiTechnicalData.companyName} (
                            {geminiTechnicalData.ticker})
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {geminiTechnicalData.analysisDate}
                          </span>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* 기술적 종합 점수 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>기술적 종합 평가</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold">
                              {geminiTechnicalData.technicalScore?.overallScore}
                              /5
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    geminiTechnicalData.technicalScore
                                      ?.overallScore >= 4
                                      ? 'bg-green-600'
                                      : geminiTechnicalData.technicalScore
                                          ?.overallScore >= 3
                                      ? 'bg-blue-600'
                                      : 'bg-red-600'
                                  }`}
                                  style={{
                                    width: `${
                                      (geminiTechnicalData.technicalScore
                                        ?.overallScore /
                                        5) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {
                                geminiTechnicalData.technicalScore
                                  .recommendation
                              }
                            </div>
                          </div>

                          {/* 세부 점수 */}
                          <div className="grid grid-cols-5 gap-4">
                            {Object.entries(
                              geminiTechnicalData.technicalScore.scoreBreakdown
                            ).map(([category, score]) => (
                              <div
                                key={category}
                                className="text-center p-3 bg-gray-50 rounded"
                              >
                                <div className="text-sm text-muted-foreground mb-1">
                                  {category === 'trend'
                                    ? '추세'
                                    : category === 'momentum'
                                    ? '모멘텀'
                                    : category === 'volatility'
                                    ? '변동성'
                                    : category === 'volume'
                                    ? '거래량'
                                    : category === 'support_resistance'
                                    ? '지지/저항'
                                    : category}
                                </div>
                                <div className="text-lg font-bold">{score}</div>
                              </div>
                            ))}
                          </div>

                          {/* 신뢰도 및 추천 */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                추천
                              </div>
                              <div className="text-lg font-bold text-purple-600">
                                {
                                  geminiTechnicalData.technicalScore
                                    .recommendation
                                }
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                신뢰도
                              </div>
                              <div className="text-lg font-bold text-purple-600">
                                {geminiTechnicalData.technicalScore.confidence}
                              </div>
                            </div>
                          </div>

                          {/* 점수 의미 */}
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            {Object.entries(
                              geminiTechnicalData.technicalScore.scoreMeaning
                            ).map(([score, meaning]) => (
                              <div
                                key={score}
                                className="text-center p-2 bg-gray-50 rounded"
                              >
                                <div className="font-medium">{score}점</div>
                                <div className="text-muted-foreground">
                                  {meaning}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 지표별 분석 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>지표별 상세 분석</CardTitle>
                        <CardDescription>
                          주요 기술적 지표별 분석 결과
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {geminiTechnicalData.indicatorAnalysis.map(
                            (indicator, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-medium">
                                      {indicator.indicator}
                                    </h4>
                                    <span className="text-sm text-muted-foreground">
                                      {indicator.value}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        indicator.score >= 4
                                          ? 'bg-green-100 text-green-800'
                                          : indicator.score >= 3
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {indicator.signal}
                                    </span>
                                    <span className="text-lg font-bold">
                                      {indicator.score}/5
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {indicator.interpretation}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {indicator.reasoning}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 주요 발견사항 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>주요 발견사항</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">
                              긍정적 신호
                            </h4>
                            <ul className="space-y-1">
                              {geminiTechnicalData.keyFindings.bullishSignals.map(
                                (signal, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-green-700"
                                  >
                                    • {signal}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-2">
                              부정적 신호
                            </h4>
                            <ul className="space-y-1">
                              {geminiTechnicalData.keyFindings.bearishSignals.map(
                                (signal, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-red-700"
                                  >
                                    • {signal}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">
                              중립적 요인
                            </h4>
                            <ul className="space-y-1">
                              {geminiTechnicalData.keyFindings.neutralFactors.map(
                                (factor, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-gray-700"
                                  >
                                    • {factor}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 매매 전략 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>매매 전략</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                진입 전략
                              </h4>
                              <p className="text-sm text-gray-600">
                                {
                                  geminiTechnicalData.tradingStrategy
                                    .entryStrategy
                                }
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                청산 전략
                              </h4>
                              <p className="text-sm text-gray-600">
                                {
                                  geminiTechnicalData.tradingStrategy
                                    .exitStrategy
                                }
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                손절매
                              </h4>
                              <p className="text-sm text-gray-600">
                                {geminiTechnicalData.tradingStrategy.stopLoss}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                목표가
                              </h4>
                              <p className="text-sm text-gray-600">
                                {
                                  geminiTechnicalData.tradingStrategy
                                    .targetPrice
                                }
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                시간 프레임
                              </h4>
                              <p className="text-sm text-gray-600">
                                {geminiTechnicalData.tradingStrategy.timeFrame}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">
                                위험 수준
                              </h4>
                              <p className="text-sm text-gray-600">
                                {geminiTechnicalData.tradingStrategy.riskLevel}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 결론 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>분석 결론</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded">
                              <h4 className="font-medium text-sm mb-1">
                                단기 전망
                              </h4>
                              <p className="text-sm text-gray-700">
                                {geminiTechnicalData.conclusion.shortTerm}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded">
                              <h4 className="font-medium text-sm mb-1">
                                중기 전망
                              </h4>
                              <p className="text-sm text-gray-700">
                                {geminiTechnicalData.conclusion.mediumTerm}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">종합 판단</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {geminiTechnicalData.conclusion.reasoning_kr}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiTechnicalData && geminiTechnicalData.error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center max-w-md">
                      <div className="text-red-600 font-medium mb-2">
                        기술 분석 오류
                      </div>
                      <div className="text-sm text-red-500 mb-4">
                        {geminiTechnicalData.message ||
                          '기술 분석 중 오류가 발생했습니다.'}
                      </div>
                      <div className="text-xs text-gray-500">
                        잠시 후 다시 시도해주세요.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <div className="text-sm">
                      기술적 분석을 시작하려면 종목을 선택하세요.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="geminiFinance">
              <div className="py-2">
                <CardTitle>재무 분석</CardTitle>
                <CardDescription className="pt-1">
                  제미니 AI 기반의 재무제표 분석 데이터입니다.
                </CardDescription>
                <Separator className="my-4" />
                {geminiFinancialPending ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RotateCw
                            className="animate-spin text-orange-500"
                            size={20}
                          />
                          재무제표 분석 진행 중...
                        </CardTitle>
                        <CardDescription>
                          재무제표를 분석하고 기업의 재무 건전성을 평가하고
                          있습니다
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            재무 데이터 분석 중...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiFinancialData && !geminiFinancialData.error ? (
                  <div className="space-y-6">
                    {/* 종목 기본 정보 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>
                            {geminiFinancialData.companyName} (
                            {geminiFinancialData.ticker})
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {geminiFinancialData.analysisDate}
                          </span>
                        </CardTitle>
                      </CardHeader>
                    </Card>

                    {/* 재무 건전성 종합 평가 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>재무 건전성 평가</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold">
                              {
                                geminiFinancialData.financialHealth
                                  ?.overallScore
                              }
                              /10
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    geminiFinancialData.financialHealth
                                      ?.overallScore >= 7
                                      ? 'bg-green-600'
                                      : geminiFinancialData.financialHealth
                                          ?.overallScore >= 5
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                  }`}
                                  style={{
                                    width: `${
                                      (geminiFinancialData.financialHealth
                                        ?.overallScore /
                                        10) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              위험도:{' '}
                              {geminiFinancialData.financialHealth.riskLevel}
                            </div>
                          </div>

                          {/* 세부 재무 점수 */}
                          <div className="grid grid-cols-5 gap-4">
                            {Object.entries(
                              geminiFinancialData.financialHealth.scoreBreakdown
                            ).map(([category, score]) => (
                              <div
                                key={category}
                                className="text-center p-3 bg-gray-50 rounded"
                              >
                                <div className="text-sm text-muted-foreground mb-1">
                                  {category === 'profitability'
                                    ? '수익성'
                                    : category === 'liquidity'
                                    ? '유동성'
                                    : category === 'solvency'
                                    ? '건전성'
                                    : category === 'efficiency'
                                    ? '효율성'
                                    : category === 'growth'
                                    ? '성장성'
                                    : category}
                                </div>
                                <div className="text-lg font-bold">
                                  {score}/10
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div
                                    className={`h-1 rounded-full ${
                                      score >= 7
                                        ? 'bg-green-500'
                                        : score >= 5
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${(score / 10) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 결론 */}
                          <div className="p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium mb-2">
                              재무 건전성 종합 평가
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {
                                geminiFinancialData.financialHealth
                                  .conclusion_kr
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 주요 재무 지표 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>주요 재무 지표</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(geminiFinancialData.keyMetrics).map(
                            ([key, metric]) => (
                              <div key={key} className="p-4 border rounded-lg">
                                <h4 className="font-medium text-sm mb-2">
                                  {key === 'revenue'
                                    ? '매출'
                                    : key === 'netIncome'
                                    ? '순이익'
                                    : key === 'cashFlow'
                                    ? '현금흐름'
                                    : key === 'debtToEquity'
                                    ? '부채비율'
                                    : key === 'roe'
                                    ? 'ROE'
                                    : key === 'roa'
                                    ? 'ROA'
                                    : key === 'grossMargin'
                                    ? '매출총이익률'
                                    : key === 'operatingMargin'
                                    ? '영업이익률'
                                    : key}
                                </h4>
                                {typeof metric === 'object' ? (
                                  <div className="space-y-1">
                                    <div className="text-lg font-bold">
                                      {metric.current || metric.ratio}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {metric.growth || metric.status}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {metric.trend}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-lg font-bold">
                                    {metric}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 소스별 분석 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>소스별 재무 분석</CardTitle>
                        <CardDescription>
                          주요 금융 정보 제공업체별 분석 결과
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {geminiFinancialData.analysisBySource.map(
                            (analysis, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">
                                    {analysis.source}
                                  </h4>
                                  <div className="flex gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      수익성: {analysis.profitabilityScore}/10
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      유동성: {analysis.liquidityScore}/10
                                    </span>
                                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                      성장성: {analysis.growthScore}/10
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                  {analysis.summary_kr}
                                </p>

                                <div className="mb-3">
                                  <h5 className="font-medium text-sm mb-2">
                                    주요 특징
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.keyHighlights.map(
                                      (highlight, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                        >
                                          {highlight}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={analysis.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  원문 보기 →
                                </a>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 위험 요인과 강점 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>위험 요인 및 강점</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-3">
                              주요 위험 요인
                            </h4>
                            <ul className="space-y-2">
                              {geminiFinancialData.redFlags.map(
                                (flag, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-red-700 flex items-start gap-2"
                                  >
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {flag}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-3">
                              주요 강점
                            </h4>
                            <ul className="space-y-2">
                              {geminiFinancialData.strengths.map(
                                (strength, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-green-700 flex items-start gap-2"
                                  >
                                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {strength}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 투자 추천 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>투자 추천</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                투자 등급
                              </div>
                              <div className="text-xl font-bold text-blue-600">
                                {geminiFinancialData.recommendation?.rating}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                목표가
                              </div>
                              <div className="text-xl font-bold text-green-600">
                                {geminiFinancialData.recommendation.targetPrice}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground">
                                투자 기간
                              </div>
                              <div className="text-xl font-bold text-purple-600">
                                {geminiFinancialData.recommendation.timeHorizon}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">투자 근거</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {geminiFinancialData.recommendation.reasoning_kr}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : geminiFinancialData && geminiFinancialData.error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center max-w-md">
                      <div className="text-red-600 font-medium mb-2">
                        재무 분석 오류
                      </div>
                      <div className="text-sm text-red-500 mb-4">
                        {geminiFinancialData.message ||
                          '재무 분석 중 오류가 발생했습니다.'}
                      </div>
                      <div className="text-xs text-gray-500">
                        잠시 후 다시 시도해주세요.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <div className="text-sm">
                      재무 분석을 시작하려면 종목을 선택하세요.
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
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
            <TabsContent value="order">
              <div className="py-2">
                <CardTitle>주문</CardTitle>
                <CardDescription className="pt-1">
                  구매 및 판매가 가능합니다.
                </CardDescription>
                <Separator className="my-4" />
                <Tabs defaultValue="buy">
                  <TabsList className="w-96">
                    <TabsTrigger value="buy">구매</TabsTrigger>
                    <TabsTrigger value="sell">판매</TabsTrigger>
                  </TabsList>
                  <TabsContent value="buy">
                    <Buy priceDetailData={priceDetailData} />
                  </TabsContent>
                  <TabsContent value="sell">
                    <div className="py-2">
                      판매가격 <Input value={priceDetailData?.last} />
                      <Button>0%</Button>
                      <Button>+1%</Button>
                      <Button>+2%</Button>
                      <Button>+3%</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </PageWrap>
  );
}
