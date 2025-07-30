"use client";

import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Toaster } from "sonner";

import useToken from "@/hooks/useToken"; // 토큰 유효성 검사 훅

import useAnalysis from "./hooks/useAnalysis"; // 분석 데이터 훅
import useHolding from "./hooks/useHolding"; // 보유 종목 데이터 훅
import useCnnl from "./hooks/useCnnl"; // 체결 데이터 훅
import useProfit from "./hooks/useProfit"; // 기간 손익 데이터 훅

import useGemini from "./hooks/useGemini"; // 제미니 관련 훅
import useGeminiNews from "./hooks/useGeminiNews"; // 제미니 뉴스 훅
import useGeminiTechnical from "./hooks/useGeminiTechnical"; // 제미니 기술적 분석 훅
import useGeminiFinancial from "./hooks/useGeminiFinancial"; // 제미니 재무 데이터 훅

import useSearchInfo from "./hooks/useSearchInfo"; // 현재가 상세 정보 훅
import useDailyprice from "./hooks/useDailyprice"; // 기간별 시세 훅
import usePriceDetail from "./hooks/usePriceDetail"; // 현제가 상세 훅
import useNewsCommunity from "./hooks/useNewsCommunity"; // 뉴스 및 커뮤니티 훅
import useExchangeRate from "./hooks/useExchangeRate"; // 환율 훅

import useBuy from "./hooks/useBuy"; // 매수 훅

import SettingsButton from "../page/log/components/header/buttons/SettingsButton";
import AutoPlayToggle from "../page/log/components/header/navigation/AutoPlayToggle";
import BuyToggle from "../page/log/components/header/navigation/BuyToggle";
import SellToggle from "../page/log/components/header/navigation/SellToggle";

import PageWrap from "./components/PageWrap";
import Header from "./components/Header";
import Aside from "./components/Aside";
import AsideItem from "./components/AsideItem";
import Main from "./components/Main";
import SectionHeader from "./components/SectionHeader";
import SectionTitle from "./components/SectionTitle";
import SectionTitleItem from "./components/SectionTitleItem";
import LoginButton from "./components/LoginButton";
import { ChartAreaDefault } from "./components/ChartAreaDefault";
import Buy from "./components/Buy";

import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { getLogoUrlByCode, getLogoUrlById } from "../page/log/utils/logoUtils";
import { DividendAnalysis } from "./components/DividendAnalysis";
import { CashFlowAnalysis } from "./components/CashFlowAnalysis";
import { ComprehensiveAnalysis } from "./components/ComprehensiveAnalysis";
import { NewsAnalysis } from "./components/NewsAnalysis";

const data = {
  navMain: [
    {
      title: "분석",
      url: "#",
      icon: BarChart3,
      isActive: false,
    },
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
  ],
};

const KEY_MAP = {
  잔고: "ovrs_pdno",
  체결: "pdno",
  미체결: "pdno",
  기간손익: "ovrs_pdno",
  분석: "name",
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
    isPending: priceDetailPending,
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
  }, [analysisData, current, list]);

  const handleMenuChange = (newActive) => {
    setActiveItem(newActive);
    switch (newActive?.title) {
      case "잔고":
        setList(
          holdingData.map((item) => ({
            ...item,
            isCnnl: cnnlData?.some(
              (cnnlItem) => cnnlItem?.pdno === item.ovrs_pdno
            ),
            isNotCnnl: cnnlData
              ?.filter((item) => item?.prcs_stat_name !== "완료")
              .some((cnnlItem) => cnnlItem?.pdno === item.ovrs_pdno),
          }))
        );
        break;
      case "미체결":
        setList(cnnlData?.filter((item) => item?.prcs_stat_name !== "완료"));
        break;
      case "분석":
        console.log("analysisData[0]", analysisData[0]);

        setList(
          analysisData
            // .filter((item) => item?.예측결과 >= 0.6)
            // .filter((item) => item?.close !== undefined && item?.close >= 3)
            // .filter((item) => Number(item?.perf_1_m) <= 0)
            .slice(0, 100)
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
      case "체결":
        setList(cnnlData?.filter((item) => item?.prcs_stat_name === "완료"));
        break;
      case "기간손익":
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
    console.log("useEffect current");
    if (asideScrollContainerRef.current) {
      console.log("useEffect current asideScrollContainerRef.current");
      const activeItemElement = asideScrollContainerRef.current.querySelector(
        `[data-index="${current}"]`
      );
      console.log("useEffect current activeItemElement");
      if (activeItemElement) {
        console.log("useEffect current activeItemElement 2");
        activeItemElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        console.log("activeItemElement.scrollIntoView");
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
    if (analysisData && analysisData.length > 0 && !dataInitialized.current) {
      setList(analysisData);
      //getDetailData(0);
      dataInitialized.current = true;
    }
  }, [analysisData]);

  useEffect(() => {
    getDetailData(current);
  }, [current, list]);

  // 디테일 데이터 가져오기
  const getDetailData = (index) => {
    console.log("getDetailData index", index);
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
    // 리액트쿼리의 isPending 상태 가능한 값?
    // 1. isPending: true - 데이터를 가져오는 중
    // 2. isPending: false - 데이터가 로드되었거나 에러가 발생
    // 3. isPending: undefined - 쿼리가 아직 실행되지 않음

    if (priceDetailPending === true || priceDetailPending === undefined) {
      return;
    }

    // if (!isAllAnalysisCompleted()) {
    //   return;
    // }

    let timeoutId;

    const currentItem = list[current];
    const code = currentItem?.[KEY_MAP[activeItem?.title]];
    // 분석데이터
    const analysisItem = analysisData.find((item) => item.name === code);

    // 현재가 상세의 isError 를 보고 정상 조회가 되었을때만 mutation 실행
    if (!isError)
      mutation({
        currentItem, // 현재 데이터
        priceDetailData, // 현재가 상세
        analysisItem, // 분석 데이터
        menu: activeItem.title, // 현재 메뉴
        //newsScore, // 뉴스분석 점수 (1-5)
        //expertScore, // 전문가 분석 점수 (1-5)
        //technicalScore, // 기술적 분석 점수 (1-5)
        //financialScore, // 재무 분석 점수 (1-5로 변환)
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
  }, [priceDetailPending]);

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
        (item) => !["기간손익", "체결"].includes(item.title)
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
          activeItem?.title === "기간손익" && (
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
        {activeItem?.title === "기간손익" && (
          <div className="flex">
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">총 매매손익</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(totalProfit?.totalProfit)?.toFixed(0)
                  ).toLocaleString("ko-KR")}
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
                  ).toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeItem?.title === "잔고" && (
          <div className="flex">
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">평가금액</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.tot_evlu_pfls_amt * krw)?.toFixed(0)
                  ).toLocaleString("ko-KR")}
                </div>
              </div>
            </div>
            <div className="flex flex-col text-xs flex-1">
              <div className="text-neutral-500">평가손익</div>
              <div className="flex items-center gap-1">
                <div className="font-bold text-lg">
                  {Number(
                    Number(holdingData2?.ovrs_tot_pfls * krw)?.toFixed(0)
                  ).toLocaleString("ko-KR")}
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
              if (activeItem?.title === "잔고") {
                return (
                  <AsideItem
                    key={index}
                    data-index={index}
                    logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                    title={`${item?.ovrs_pdno} ${item?.ovrs_item_name}`}
                    date={`${item?.evlu_pfls_rt}%`}
                    info={`${Number(
                      (Number(item?.frcr_evlu_pfls_amt) * krw)?.toFixed(0)
                    ).toLocaleString("ko-KR")}원`}
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
              } else if (activeItem?.title === "미체결") {
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
                    ).toLocaleString("ko-KR")}원)`}
                    description={`${item?.prcs_stat_name}`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              } else if (activeItem?.title === "체결") {
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
                    ).toLocaleString("ko-KR")}원)`}
                    description={`${item?.prcs_stat_name}`}
                    onClick={() => setCurrent(index)}
                    active={current === index}
                  />
                );
              } else if (activeItem?.title === "기간손익") {
                if (profitType === "individual") {
                  return (
                    <AsideItem
                      key={index}
                      data-index={index}
                      logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                      title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                      date={`${dayjs(item?.trad_day).format("YYYY-MM-DD")}`}
                      info={`${Number(
                        Number(item?.ovrs_rlzt_pfls_amt)?.toFixed(0)
                      ).toLocaleString("ko-KR")}원 (${Number(
                        item?.pftrt
                      )?.toFixed(2)})`}
                      description={`${Number(item?.pchs_avg_pric)?.toFixed(
                        2
                      )} > ${Number(item?.avg_sll_unpr)?.toFixed(2)}`}
                      onClick={() => setCurrent(index)}
                      active={current === index}
                    />
                  );
                } else if (profitType === "daily") {
                  return (
                    <AsideItem
                      key={index}
                      data-index={index}
                      title={dayjs(item?.trad_day).format("YYYY-MM-DD")}
                      date=""
                      info={
                        "손익 : " +
                        Number(
                          Number(item?.totalProfit)?.toFixed(0)
                        ).toLocaleString("ko-KR") +
                        "원 " +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        )?.toFixed(2)}%)`
                      }
                      description={
                        "판매대금 : " +
                        Number(
                          Number(item.totalInvestment)?.toFixed(0)
                        ).toLocaleString("ko-KR") +
                        "원"
                      }
                    />
                  );
                } else if (profitType === "monthly") {
                  return (
                    <AsideItem
                      key={index}
                      data-index={index}
                      title={dayjs(item?.yearMonth).format("YYYY년 MM월")}
                      date={`${item?.tradingDays?.length}일간`}
                      info={
                        "손익 : " +
                        Number(
                          Number(item?.totalProfit)?.toFixed(0)
                        ).toLocaleString("ko-KR") +
                        "원 " +
                        `(${(
                          (Number(item?.totalProfit) /
                            Number(item?.totalInvestment)) *
                          100
                        )?.toFixed(2)}%)`
                      }
                      description={
                        "판매대금 : " +
                        Number(
                          Number(item.totalInvestment)?.toFixed(0)
                        ).toLocaleString("ko-KR") +
                        "원"
                      }
                    />
                  );
                }
              } else if (activeItem?.title === "분석") {
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
            if (activeItem?.title === "잔고") {
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
                  ).toLocaleString("ko-KR")}원)`}
                  description={`${Number(item?.pchs_avg_pric)?.toFixed(
                    2
                  )} > ${Number(item?.now_pric2)?.toFixed(2)} (${Number(
                    item?.ovrs_cblc_qty
                  ).toLocaleString("ko-KR")})`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === "미체결") {
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
                  ).toLocaleString("ko-KR")}원)`}
                  description={`${item?.prcs_stat_name}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === "체결") {
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
                  ).toLocaleString("ko-KR")}원)`}
                  description={`${item?.prcs_stat_name}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === "기간손익") {
              return (
                <SectionTitleItem
                  key={index}
                  logoUrl={getLogoUrlByCode(item?.ovrs_pdno)}
                  title={`${item?.ovrs_item_name} (${item?.ovrs_pdno})`}
                  date={`${dayjs(item?.trad_day).format("YYYY-MM-DD")}`}
                  info={`${Number(item?.ovrs_rlzt_pfls_amt)?.toFixed(
                    0
                  )}원 (${Number(item?.pftrt)?.toFixed(2)})`}
                  description={`${Number(item?.pchs_avg_pric)?.toFixed(
                    2
                  )} > ${Number(item?.avg_sll_unpr)?.toFixed(2)}`}
                  active={current === index}
                />
              );
            } else if (activeItem?.title === "분석") {
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
          <Tabs defaultValue="analysis">
            <TabsList>
              <TabsTrigger value="analysis">분석</TabsTrigger>
              <TabsTrigger value="newsAnalysis">뉴스분석</TabsTrigger>
              <TabsTrigger value="chart">차트</TabsTrigger>
              <TabsTrigger value="stock">종목정보</TabsTrigger>
              {/* <TabsTrigger value="news">뉴스</TabsTrigger> */}
              <TabsTrigger value="community">커뮤니티</TabsTrigger>
              {/* <TabsTrigger value="order">주문</TabsTrigger> */}
            </TabsList>
            <TabsContent value="analysis">
              <ComprehensiveAnalysis
                data={currentAnalysisData?.comprehensiveAnalysis}
              />
            </TabsContent>
            <TabsContent value="newsAnalysis">
              <NewsAnalysis ticker={currentAnalysisData?.name} />
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
                        <Input value={searchData?.std_pdno || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품영문명</Label>
                        <Input
                          value={searchData?.prdt_eng_name || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품명</Label>
                        <Input value={searchData?.prdt_name || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>국가명</Label>
                        <Input value={searchData?.natn_name || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>국가코드</Label>
                        <Input value={searchData?.natn_cd || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품분류명</Label>
                        <Input
                          value={searchData?.prdt_clsf_name || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상품분류코드</Label>
                        <Input
                          value={searchData?.prdt_clsf_cd || ""}
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
                          value={searchData?.tr_mket_name || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래시장코드</Label>
                        <Input value={searchData?.tr_mket_cd || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외거래소명</Label>
                        <Input
                          value={searchData?.ovrs_excg_name || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외거래소코드</Label>
                        <Input
                          value={searchData?.ovrs_excg_cd || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래통화코드</Label>
                        <Input value={searchData?.tr_crcy_cd || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>통화명</Label>
                        <Input value={searchData?.crcy_name || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외액면가</Label>
                        <Input value={searchData?.ovrs_papr || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>매수단위수량</Label>
                        <Input
                          value={searchData?.buy_unit_qty || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>매도단위수량</Label>
                        <Input
                          value={searchData?.sll_unit_qty || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>거래단위금액</Label>
                        <Input value={searchData?.tr_unit_amt || ""} readOnly />
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
                          value={searchData?.lstg_stck_num || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장일자</Label>
                        <Input value={searchData?.lstg_dt || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장여부</Label>
                        <Input value={searchData?.lstg_yn || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장폐지종목여부</Label>
                        <Input
                          value={searchData?.lstg_abol_item_yn || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>상장폐지일자</Label>
                        <Input
                          value={searchData?.lstg_abol_dt || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식거래정지구분코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_tr_stop_dvsn_cd || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식상품그룹번호</Label>
                        <Input
                          value={searchData?.ovrs_stck_prdt_grp_no || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식등록사유코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_erlm_rosn_cd || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>해외주식이력권리구분코드</Label>
                        <Input
                          value={searchData?.ovrs_stck_hist_rght_dvsn_cd || ""}
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
                          value={searchData?.ovrs_now_pric1 || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>최종수신일시</Label>
                        <Input
                          value={searchData?.last_rcvg_dtime || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>SEDOL번호</Label>
                        <Input value={searchData?.sedol_no || ""} readOnly />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>블룸버그티커</Label>
                        <Input
                          value={searchData?.blbg_tckr_text || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>기관용도ISIN코드</Label>
                        <Input
                          value={searchData?.istt_usge_isin_cd || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>메모</Label>
                        <Input value={searchData?.memo_text1 || ""} readOnly />
                      </div>
                      {/* 필요시 추가 필드 계속 추가 */}
                    </CardContent>
                  </Card>
                </CardContent>
              </div>
            </TabsContent>
            {/* <TabsContent value="news">
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
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent> */}

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
                              "YYYY-MM-DD HH:mm"
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
            {/* <TabsContent value="order">
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
            </TabsContent> */}
          </Tabs>
        </div>
      </Main>
    </PageWrap>
  );
}
