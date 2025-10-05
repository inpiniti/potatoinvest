"use client";
import { useQuery } from "@tanstack/react-query";
import { portfolioSelectionStore } from "@/store/portfolioSelectionStore";

interface PortfolioItem {
  code: string;
  ratio: string;
}

interface Investor {
  no: number;
  name: string;
  ratio?: string; // 종목이 선택되었을 때 해당 종목의 보유 비율
  totalValue?: string;
  totalValueNum?: number;
  portfolio?: PortfolioItem[];
}

interface PersonItem {
  no: number;
  name: string;
  ratio: string;
}

interface Stock {
  stock: string;
  ratio?: string; // 자산가가 선택되었을 때 해당 자산가의 보유 비율
  person?: PersonItem[];
  person_count?: number;
  avg_ratio?: string;
  sum_ratio?: string;
}

interface DataromaBaseResponse {
  based_on_person?: Investor[];
  based_on_stock?: Stock[];
}

export function usePortfolio() {
  const {
    selectedInvestor,
    selectedStock,
    selectInvestor,
    selectStock,
    clear,
  } = portfolioSelectionStore();

  // 포트폴리오 데이터 조회 (24시간 캐시)
  const query = useQuery<DataromaBaseResponse>({
    queryKey: ["portfolio", "dataroma-base"],
    queryFn: async () => {
      const res = await fetch("/api/dataroma/base", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "포트폴리오 데이터를 불러오지 못했습니다.");
      }
      return (await res.json()) as DataromaBaseResponse;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24시간
    refetchOnWindowFocus: false,
  });

  // 자산가 리스트
  const investors = query.data?.based_on_person ?? [];

  // 종목 리스트
  const stocks = query.data?.based_on_stock ?? [];

  // 필터링된 리스트
  // 자산가가 선택되면 해당 자산가의 portfolio를 기준으로 종목 표시
  const filteredStocks = selectedInvestor
    ? (() => {
        const investor = investors.find(
          (inv) => inv.no === Number(selectedInvestor)
        );
        if (!investor?.portfolio) return [];

        // portfolio의 각 항목을 Stock 형식으로 변환
        return investor.portfolio.map((item) => {
          // 기존 stocks 데이터에서 매칭되는 종목 찾기 (추가 정보 활용)
          const stockDetail = stocks.find((s) => s.stock === item.code);

          return {
            stock: item.code,
            ratio: item.ratio, // 자산가의 보유 비율
            person: stockDetail?.person,
            person_count: stockDetail?.person_count,
            avg_ratio: stockDetail?.avg_ratio,
            sum_ratio: stockDetail?.sum_ratio,
          } as Stock;
        });
      })()
    : stocks;

  // 종목이 선택되면 해당 종목의 person을 기준으로 자산가 표시
  const filteredInvestors = selectedStock
    ? (() => {
        const stock = stocks.find((s) => s.stock === selectedStock);
        if (!stock?.person) return [];

        // person의 각 항목을 Investor 형식으로 변환
        return stock.person.map((item) => {
          // 기존 investors 데이터에서 매칭되는 자산가 찾기 (추가 정보 활용)
          const investorDetail = investors.find((inv) => inv.no === item.no);

          return {
            no: item.no,
            name: item.name,
            ratio: item.ratio, // 해당 종목의 보유 비율
            totalValue: investorDetail?.totalValue,
            totalValueNum: investorDetail?.totalValueNum,
            portfolio: investorDetail?.portfolio,
          } as Investor;
        });
      })()
    : investors;

  // 선택된 항목의 상세 정보
  const selectedInvestorDetail = selectedInvestor
    ? investors.find((inv) => inv.no === Number(selectedInvestor))
    : null;

  const selectedStockDetail = selectedStock
    ? stocks.find((stock) => stock.stock === selectedStock)
    : null;

  return {
    // 데이터
    investors: filteredInvestors,
    stocks: filteredStocks,
    allInvestors: investors, // 필터링 안 된 전체 리스트
    allStocks: stocks, // 필터링 안 된 전체 리스트

    // 선택 상태
    selectedInvestor,
    selectedStock,
    selectedInvestorDetail, // 선택된 자산가 상세 정보
    selectedStockDetail, // 선택된 종목 상세 정보

    // 선택 함수
    selectInvestor: (no: number | null) => {
      // 같은 자산가를 다시 선택하면 해제
      const currentNo = selectedInvestor ? Number(selectedInvestor) : null;
      if (no === currentNo) {
        selectInvestor(null);
      } else {
        selectInvestor(no ? String(no) : null);
      }
    },
    selectStock: (code: string | null) => {
      // 같은 종목을 다시 선택하면 해제
      if (code === selectedStock) {
        selectStock(null);
      } else {
        selectStock(code);
      }
    },
    clearSelection: clear,

    // 쿼리 상태
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default usePortfolio;
