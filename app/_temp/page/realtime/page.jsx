"use client";

import IStock from "@/app/interface/IStock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  LineChart,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useTrading from "@/hooks/useTrading";
import useAccount from "@/hooks/useAccount";
import useAi from "@/hooks/useAi";
import useApi from "@/hooks/useApi"; // API 훅 추가
import useQuotations from "@/hooks/useQuotations"; // 시세 조회 훅 추가

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import OpacityLoader from "@/components/ui/opacity-loader";

import aiModels from "@/json/ai_models.json"; // AI 모델 데이터 추가

const RealTime = () => {
  const [cano, acntPrdtCd] = useAccount();
  const api = useApi();
  const { 미체결내역, 매수 } = useTrading();
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi();
  const { 현재가상세 } = useQuotations(); // 종목 현재가 조회 추가

  // 데이터를 하나의 상태로 통합
  const [stockData, setStockData] = useState([]);
  const [미체결리스트, set미체결리스트] = useState([]);
  const [구매내역, set구매내역] = useState([]); // 구매내역 상태 추가
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [sortField, setSortField] = useState("close");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [models, setModels] = useState([]); // 모델 상태 추가

  // 선택된 종목과 상세 정보 상태 추가
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetail, setStockDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 종목 상세 정보 조회 함수
  const fetchStockDetail = useCallback(
    async (stockCode) => {
      if (!stockCode) return;

      setDetailLoading(true);
      try {
        const detail = await 현재가상세(stockCode);
        setStockDetail(detail);
      } catch (error) {
        console.error("종목 상세 정보 조회 실패:", error);
        setStockDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [현재가상세]
  );

  // 종목 선택 핸들러
  const handleStockSelect = useCallback(
    (stock) => {
      setSelectedStock(stock);
      fetchStockDetail(stock.name || stock.code);
      setIsDialogOpen(true);
    },
    [fetchStockDetail]
  );

  // 구매 처리 함수
  const handleBuy = useCallback(
    async (stockCode, quantity, price) => {
      if (!stockCode || !quantity || !price) {
        alert("종목코드, 수량, 가격을 모두 입력해주세요.");
        return;
      }

      try {
        // 구매 버튼 클릭 시 로딩 상태로 변경
        setDetailLoading(true);

        const response = await 매수({
          ovrs_pdno: stockCode,
          now_pric2: String(price),
          ord_qty: String(quantity),
        });

        if (response.rt_cd === "0") {
          // 성공적으로 주문이 접수된 경우
          alert(
            `[${stockCode}] ${quantity}주 매수 주문이 접수되었습니다. (지정가: ${price})`
          );
        } else {
          // 주문 접수 실패
          alert(`매수 주문 실패: ${response.msg1}`);
        }
      } catch (error) {
        console.error("매수 오류:", error);
        alert("매수 주문 중 오류가 발생했습니다.");
      } finally {
        setDetailLoading(false);
      }
    },
    [api]
  );

  // Fetch data and run predictions on component mount - 수정된 함수
  const fetchDataAndPredict = useCallback(async () => {
    try {
      setIsLoading(true);
      setPredictionsLoading(true);

      // 1. Get data for analysis
      const 분석할데이터 = await 데이터가져오기();

      // 기본 데이터는 바로 설정
      setStockData(분석할데이터);

      // 2. Preprocess data
      const 전처리된분석데이터 = await 전처리(분석할데이터);

      // 3. 모델 로드 (한 번만)
      let 사용할모델들 = models;
      if (models.length === 0) {
        try {
          const loadedModels = await Promise.all(
            aiModels.ai_models.map((model) =>
              역직렬화(model.model, model.weights)
            )
          );
          setModels(loadedModels);
          사용할모델들 = loadedModels;
        } catch (modelError) {
          console.warn("모델 로딩 실패:", modelError);
          // 기본 모델이라도 시도해봄
          try {
            const defaultModel = await 역직렬화(
              "stock_prediction_model",
              "default_weights"
            );
            사용할모델들 = [defaultModel];
            setModels([defaultModel]);
          } catch (defaultModelError) {
            console.error("기본 모델 로드 실패:", defaultModelError);
            throw new Error("AI 모델을 로드할 수 없습니다");
          }
        }
      }

      // 4. 모든 모델에 대해 예측 수행
      const 예측결과들 = await Promise.all(
        사용할모델들.map((model) => 예측(model, 전처리된분석데이터))
      );

      // 5. 예측 결과 평균 계산
      const 예측결과평균 = 예측결과들[0].map(
        (_, colIndex) =>
          예측결과들.reduce((sum, row) => sum + row[colIndex], 0) /
          예측결과들.length
      );

      // 6. 분석할 데이터에 예측 결과 추가 후 상태 업데이트
      const 최종분석데이터 = 분석할데이터.map((row, index) => ({
        ...row,
        예측결과: 예측결과평균[index],
      }));

      // 예측이 완료된 데이터로 상태 업데이트
      setStockData(최종분석데이터.filter((item) => item.예측결과 > 0.6));
    } catch (error) {
      console.error("데이터 가져오기 및 예측 중 오류:", error);
      // 데이터만 설정하고 예측은 건너뜀
      try {
        const basicData = await 데이터가져오기();
        setStockData(basicData);
      } catch (dataError) {
        console.error("기본 데이터 가져오기 실패:", dataError);
        setStockData([]);
      }
    } finally {
      setPredictionsLoading(false);
      setIsLoading(false);
    }
  }, [데이터가져오기, 전처리, 역직렬화, 예측, models]);

  // 구매내역 조회 함수 추가
  const 구매내역조회 = async () => {
    try {
      if (cano && acntPrdtCd) {
        const payload = {
          CANO: cano,
          ACNT_PRDT_CD: acntPrdtCd,
          OVRS_EXCG_CD: "NASD",
          TR_CRCY_CD: "USD",
          CTX_AREA_FK200: "",
          CTX_AREA_NK200: "",
        };

        const response = await api.trading.inquireBalance(payload);
        const data = await response.json();

        set구매내역(data.output1 || []);
      }
    } catch (error) {
      console.error("구매내역 조회 실패:", error);
      set구매내역([]);
    }
  };

  // Get pending transactions
  const 미체결내역조회 = async () => {
    try {
      if (cano && acntPrdtCd) {
        const data = await 미체결내역();
        set미체결리스트(data.output || []);
      }
    } catch (error) {
      console.error("미체결 내역 조회 실패:", error);
    }
  };

  // 미체결내역 및 구매내역 조회 함수를 수정합니다
  const 미체결및구매내역조회 = async () => {
    try {
      setPendingLoading(true);
      await 미체결내역조회();
      await 구매내역조회();
    } catch (error) {
      console.error("미체결/구매내역 조회 실패:", error);
    } finally {
      setPendingLoading(false);
    }
  };

  // Check if stock is in settlement
  const isInSettlement = useCallback(
    (stockCode) => {
      return 미체결리스트.some((item) => item.pdno === stockCode);
    },
    [미체결리스트]
  );

  // 종목이 구매내역에 포함되어 있는지 확인
  const isPurchased = useCallback(
    (stockCode) => {
      return 구매내역.some((item) => item.ovrs_pdno === stockCode);
    },
    [구매내역]
  );

  // Load data and pending transactions on component mount
  useEffect(() => {
    fetchDataAndPredict();
    미체결및구매내역조회();
  }, []);

  // Sort data
  const sortedData = useMemo(() => {
    if (!stockData || stockData.length === 0) return [];

    return [...stockData].sort((a, b) => {
      let aValue = Number(a[sortField]);
      let bValue = Number(b[sortField]);

      // Handle non-numeric fields
      if (isNaN(aValue)) {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [stockData, sortField, sortOrder]);

  // RealTime 컴포넌트 내에 이전/다음 종목으로 이동하는 함수 추가
  const navigateToStock = useCallback(
    (direction) => {
      if (!selectedStock || !sortedData.length) return;

      const currentIndex = sortedData.findIndex(
        (stock) =>
          (stock.name || stock.code) ===
          (selectedStock.name || selectedStock.code)
      );

      if (currentIndex === -1) return;

      let nextIndex;
      if (direction === "next") {
        nextIndex = (currentIndex + 1) % sortedData.length;
      } else {
        nextIndex = (currentIndex - 1 + sortedData.length) % sortedData.length;
      }

      const nextStock = sortedData[nextIndex];
      setSelectedStock(nextStock);
      fetchStockDetail(nextStock.name || nextStock.code);
    },
    [selectedStock, sortedData, fetchStockDetail]
  );

  // Calculate pagination
  const totalPages = useMemo(
    () => Math.ceil(sortedData.length / itemsPerPage),
    [sortedData, itemsPerPage]
  );

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  /**
   * 숫자를 가격 형식으로 포맷팅 (예: 1,234,567)
   */
  function formatPrice(price) {
    if (!price) return "0";
    return Number(price).toLocaleString();
  }

  /**
   * 숫자를 천 단위 구분자가 있는 형식으로 포맷팅 (예: 1,234,567)
   */
  function formatNumber(number) {
    if (!number) return "0";
    return Number(number).toLocaleString();
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
        <h1 className="text-xl font-bold">실시간 시세</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={미체결및구매내역조회}
            disabled={pendingLoading}
            className="flex items-center gap-1"
          >
            {pendingLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            미체결/보유 갱신
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDataAndPredict}
            disabled={predictionsLoading}
            className="flex items-center gap-1"
          >
            {predictionsLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <LineChart className="h-3 w-3 mr-1" />
            )}
            데이터 갱신
          </Button>
        </div>
      </div>
      {/* Pagination (Top) */}
      {!isLoading && stockData.length > 0 && (
        <Pagination className="my-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <div className="px-2">...</div>
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="text-gray-500">주식 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      )}
      {/* Table */}
      {!isLoading && (
        <div className="rounded-sm overflow-hidden border bg-white">
          <Table className="rounded-lg p-4">
            <TableHeader>
              <TableRow>
                <TableHead>로고</TableHead>
                <TableHead>종목코드</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("close")}
                >
                  종가{" "}
                  {sortField === "close" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("perf_1_m")}
                >
                  1개월{" "}
                  {sortField === "perf_1_m" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 hidden sm:table-cell"
                  onClick={() => handleSort("perf_3_m")}
                >
                  3개월{" "}
                  {sortField === "perf_3_m" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline h-4 w-4" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead>상태</TableHead>
                <TableHead>예측</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((live) => {
                const prediction = live.예측결과;
                const hasSettlement = isInSettlement(live.name || live.code);
                const hasPurchased = isPurchased(live.name || live.code);

                return (
                  <TableRow
                    key={live.name || live.code}
                    className={`${
                      hasSettlement || hasPurchased ? "bg-gray-50" : ""
                    } cursor-pointer hover:bg-gray-100`}
                    onClick={() => handleStockSelect(live)}
                  >
                    <TableCell>
                      <Avatar className="border h-8 w-8">
                        <AvatarImage
                          src={`https://s3-symbol-logo.tradingview.com/${live.logoid}--big.svg`}
                          alt="@radix-vue"
                        />
                        <AvatarFallback>
                          {live.description?.slice(0, 2) || "NA"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {live.name || live.code}
                    </TableCell>
                    <TableCell
                      className={
                        Number(live.change) < 0
                          ? "text-blue-400"
                          : "text-red-400"
                      }
                    >
                      {live.close} ({Number(live.change || 0)?.toFixed(1)}%)
                    </TableCell>
                    <TableCell
                      className={
                        Number(live.perf_1_m) < 0
                          ? "text-blue-400"
                          : "text-red-400"
                      }
                    >
                      {Number(live.perf_1_m || 0)?.toFixed(1)}%
                    </TableCell>
                    <TableCell
                      className={`${
                        Number(live.perf_3_m) < 0
                          ? "text-blue-400"
                          : "text-red-400"
                      } hidden sm:table-cell`}
                    >
                      {Number(live.perf_3_m || 0)?.toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {hasSettlement && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          결제중
                        </span>
                      )}
                      {hasPurchased && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          보유중
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {prediction !== undefined ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            prediction > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {prediction > 0 ? "상승" : "하락"} (
                          {prediction?.toFixed(2)}%)
                        </span>
                      ) : predictionsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Pagination (Bottom) */}
      {!isLoading && stockData.length > 0 && (
        <Pagination className="my-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <div className="px-2">...</div>
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStock && (
                <Avatar className="border h-8 w-8">
                  <AvatarImage
                    src={`https://s3-symbol-logo.tradingview.com/${selectedStock.logoid}--big.svg`}
                    alt={selectedStock.name || selectedStock.code}
                  />
                  <AvatarFallback>
                    {selectedStock?.description?.slice(0, 2) || "NA"}
                  </AvatarFallback>
                </Avatar>
              )}
              {selectedStock?.name || selectedStock?.code}{" "}
              <span className="text-gray-500 text-sm font-normal">
                {selectedStock?.description}
              </span>
              {/* 상태 표시 추가 */}
              {selectedStock &&
                isInSettlement(selectedStock.name || selectedStock.code) && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    결제중
                  </span>
                )}
              {selectedStock &&
                isPurchased(selectedStock.name || selectedStock.code) && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    보유중
                  </span>
                )}
            </DialogTitle>
            <DialogDescription>
              종목의 실시간 현재가 및 상세 정보입니다.
            </DialogDescription>
          </DialogHeader>

          <OpacityLoader
            isLoading={detailLoading}
            message="상세 정보를 불러오는 중입니다..."
          >
            <div className="flex flex-col gap-4">
              {stockDetail && (
                <>
                  {/* 현재가 정보 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">현재가 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">현재가</p>
                          <p
                            className={`text-2xl font-bold ${
                              stockDetail.t_xsgn === "1"
                                ? "text-blue-600"
                                : stockDetail.t_xsgn === "2"
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {Number(stockDetail.last)?.toFixed(3)} $
                          </p>
                          <p
                            className={`text-sm ${
                              stockDetail.t_xsgn === "1"
                                ? "text-blue-500"
                                : stockDetail.t_xsgn === "2"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {stockDetail.t_xrat}% (
                            {formatPrice(stockDetail.t_xdif)})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">거래량</p>
                          <p className="text-lg font-semibold">
                            {formatNumber(stockDetail.pvol)}
                          </p>
                          <p className="text-sm text-gray-500">
                            거래대금:{" "}
                            {formatNumber(
                              Math.round(stockDetail.pamt / 1000000)
                            )}
                            백만
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500">시가</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.open)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">고가</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.high)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">저가</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.low)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">기준가</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.base)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 매수 옵션 카드 추가 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">매수 옵션</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 수량 입력 필드 */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <label
                            htmlFor="quantity"
                            className="text-sm font-medium"
                          >
                            수량:
                          </label>
                          <input
                            id="quantity"
                            type="number"
                            className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="구매 수량 입력"
                            key={stockDetail.last}
                            defaultValue={
                              stockDetail?.last && Number(stockDetail.last) > 0
                                ? Math.max(
                                    1,
                                    Math.floor(
                                      100000 / (Number(stockDetail.last) * 1500)
                                    )
                                  )
                                : 1
                            }
                            min={1}
                          />
                        </div>

                        {/* 구매 버튼 그룹 - 가로 배치로 수정 */}
                        <div className="flex flex-col flex-row gap-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-sm"
                            onClick={() => {
                              const quantity =
                                document.getElementById("quantity").value || 1;
                              const currentPrice = Number(stockDetail.last);
                              // 소수점 둘째자리까지 반올림
                              const formattedPrice =
                                Math.round(currentPrice * 100) / 100;
                              handleBuy(
                                selectedStock?.name || selectedStock?.code,
                                quantity,
                                formattedPrice
                              );
                            }}
                          >
                            매수
                          </Button>

                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                            onClick={() => {
                              const quantity =
                                document.getElementById("quantity").value || 1;
                              const currentPrice = Number(stockDetail.last);
                              // 1% 할인된 가격, 소수점 둘째자리까지 반올림
                              const discountedPrice =
                                Math.round(currentPrice * 0.99 * 100) / 100;
                              handleBuy(
                                selectedStock?.name || selectedStock?.code,
                                quantity,
                                discountedPrice
                              );
                            }}
                          >
                            -1% 매수
                          </Button>

                          <Button
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm"
                            onClick={() => {
                              const quantity =
                                document.getElementById("quantity").value || 1;
                              const currentPrice = Number(stockDetail.last);
                              // 2% 할인된 가격, 소수점 둘째자리까지 반올림
                              const discountedPrice =
                                Math.round(currentPrice * 0.98 * 100) / 100;
                              handleBuy(
                                selectedStock?.name || selectedStock?.code,
                                quantity,
                                discountedPrice
                              );
                            }}
                          >
                            -2% 매수
                          </Button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          * 지정가 주문이며, 시장 상황에 따라 체결되지 않을 수
                          있습니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 추가 정보 */}
                  <Card className="hidden sm:block">
                    <CardHeader>
                      <CardTitle className="text-lg">추가 정보</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">52주 최고</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.h52p)}
                            <span className="text-xs text-gray-400 ml-1">
                              ({stockDetail.h52d?.slice(0, 4)}.
                              {stockDetail.h52d?.slice(4, 6)}.
                              {stockDetail.h52d?.slice(6, 8)})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">52주 최저</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.l52p)}
                            <span className="text-xs text-gray-400 ml-1">
                              ({stockDetail.l52d?.slice(0, 4)}.
                              {stockDetail.l52d?.slice(4, 6)}.
                              {stockDetail.l52d?.slice(6, 8)})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">업종</p>
                          <p className="text-sm font-medium">
                            {stockDetail.e_icod}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PER</p>
                          <p className="text-sm font-medium">
                            {stockDetail.perx}배
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PBR</p>
                          <p className="text-sm font-medium">
                            {stockDetail.pbrx}배
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">시가총액</p>
                          <p className="text-sm font-medium">
                            {formatNumber(
                              Math.round(stockDetail.mcap / 100000000)
                            )}
                            억
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">상장주식수</p>
                          <p className="text-sm font-medium">
                            {formatNumber(
                              Math.round(stockDetail.shar / 1000000)
                            )}
                            백만주
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">EPS</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.epsx)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">BPS</p>
                          <p className="text-sm font-medium">
                            {formatPrice(stockDetail.bpsx)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI 분석 정보 */}
                  {selectedStock?.예측결과 !== undefined && (
                    <Card className="hidden sm:block">
                      <CardHeader>
                        <CardTitle className="text-lg">AI 분석 정보</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center gap-2">
                          <p
                            className={`text-xl font-bold ${
                              selectedStock.예측결과 > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedStock.예측결과 > 0
                              ? "상승 예측"
                              : "하락 예측"}
                          </p>
                          <p className="text-sm text-gray-500">
                            예상 변동률: {selectedStock.예측결과?.toFixed(2)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            * AI가 분석한 이 종목의 예상 변동률입니다.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {!stockDetail && !detailLoading && (
                <div className="py-4 text-center text-gray-500">
                  현재가 정보를 가져올 수 없습니다.
                </div>
              )}
            </div>
          </OpacityLoader>

          <DialogFooter className="flex flex-row justify-end items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateToStock("prev")}
              disabled={detailLoading || sortedData.length <= 1}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">이전 종목</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateToStock("next")}
              disabled={detailLoading || sortedData.length <= 1}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">다음 종목</span>
            </Button>

            <Button
              type="button"
              onClick={() =>
                fetchStockDetail(selectedStock?.name || selectedStock?.code)
              }
              disabled={detailLoading}
              variant="outline"
            >
              {detailLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              새로고침
            </Button>

            <DialogClose asChild>
              <Button type="button" variant="secondary">
                닫기
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RealTime;
