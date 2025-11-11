"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useBalance } from "@/hooks/useBalance";
import { useInvestor } from "@/hooks/useInvestor";

const held = () => {
  // 보유종목 데이터
  const { holdings, isLoading: balanceLoading } = useBalance();

  // 투자자 정보 (조인용)
  const { stocks: investorStocks, isLoading: investorLoading } = useInvestor({
    enabled: true,
  });

  const [selectedTab, setSelectedTab] = useState("all");

  // holdings를 investorStocks와 조인하여 enriched data 생성
  const enrichedHoldings = useMemo(() => {
    if (!holdings || !investorStocks) return [];

    return holdings
      .map((holding) => {
        const stock = holding.pdno; // 종목코드
        const investorData =
          investorStocks.find((s) => s.stock === stock) || {};

        return {
          ...holding,
          stock,
          prdt_name: holding.prdt_name, // 종목명
          exchange: investorData.exchange || "NASDAQ",
          logoid: investorData.logoid || "",
          person: investorData.person || [],
          person_count: investorData.person_count || 0,
          dcf_vs_market_cap_pct: investorData.dcf_vs_market_cap_pct || 0,
          bbUpper: investorData.bbUpper || 0,
          bbLower: investorData.bbLower || 0,
          close:
            investorData.close ||
            Number(holding.ovrs_now_pric1 || holding.prpr || 0),
          ai: investorData.ai || 0,
          // 정규화된 필드명 (우선순위: 신규 필드 > legacy 필드)
          hldg_qty:
            holding.ccld_qty_smtl1 ||
            holding.cblc_qty13 ||
            holding.hldg_qty ||
            "0",
          pchs_avg_pric: holding.avg_unpr3 || holding.pchs_avg_pric || "0",
          prpr: holding.ovrs_now_pric1 || holding.prpr || "0",
          evlu_amt: holding.frcr_evlu_amt2 || holding.evlu_amt || "0",
          evlu_pfls_amt: holding.evlu_pfls_amt2 || holding.evlu_pfls_amt || "0",
          evlu_pfls_rt: holding.evlu_pfls_rt1 || holding.evlu_pfls_rt || "0",
        };
      })
      .filter((item) => {
        // 평가금액이 0원인 종목 필터링
        const evaluationAmount = Number(item.evlu_amt || 0);
        return evaluationAmount > 0;
      });
  }, [holdings, investorStocks]);

  // 탭별 필터링
  const filteredData = useMemo(() => {
    return enrichedHoldings?.filter((item) => {
      if (selectedTab === "buy") {
        return (
          item.ai >= 0.5 &&
          item.dcf_vs_market_cap_pct >= 300 &&
          item.close <= item.bbLower
        );
      }
      if (selectedTab === "sell") {
        return item.ai < 0.5 && item.close > item.bbUpper;
      }
      return true;
    });
  }, [enrichedHoldings, selectedTab]);

  const isLoading = balanceLoading || investorLoading;

  // 현재가격이 상한선 보다 크면 빨간색, 하한선 보다 작으면 파란색
  const getPriceColor = (price, lower, upper) => {
    if (price >= upper) return "text-red-400";
    if (price <= lower) return "text-blue-400";
    return "";
  };

  // 미래가치 색상
  const getFutureValueColor = (value) => {
    if (value >= 1000) return "text-red-600";
    if (value >= 700) return "text-red-500";
    if (value >= 500) return "text-red-400";
    if (value >= 300) return "text-red-300";
    if (value >= 200) return "text-red-200";
    if (value >= 100) return "text-red-100";
    return "text-red-50";
  };

  // AI 예측 색상
  const getAIPredictionColor = (value) => {
    if (value * 100 >= 66) return "text-red-600";
    if (value * 100 >= 61) return "text-red-500";
    if (value * 100 >= 58) return "text-red-400";
    if (value * 100 >= 55) return "text-red-300";
    if (value * 100 >= 53) return "text-red-200";
    if (value * 100 >= 51) return "text-red-100";
    return "text-red-50";
  };

  // Virtualization setup
  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredData?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  // 로우 클릭시 해당 종목의 상세 화면으로 이동
  const onRowClick = ({ exchange, stock }) => {
    window.location.href = `/detail/${exchange}/${stock}`;
  };

  return (
    <div>
      <Tabs
        value={selectedTab}
        onValueChange={(e) => {
          setSelectedTab(e);
        }}
        className="m-2"
      >
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="sell">매도추천</TabsTrigger>
          <TabsTrigger value="buy">매수추천</TabsTrigger>
        </TabsList>
      </Tabs>
      <div
        ref={parentRef}
        className="h-[calc(100vh-100px)] overflow-auto border-t"
      >
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>로고</TableHead>
              <TableHead>종목코드</TableHead>
              <TableHead>종목명</TableHead>
              <TableHead>보유수량</TableHead>
              <TableHead>평균단가</TableHead>
              <TableHead>현재가</TableHead>
              <TableHead>평가금액</TableHead>
              <TableHead>평가손익</TableHead>
              <TableHead>수익률</TableHead>
              <TableHead>투자자 수</TableHead>
              <TableHead>
                <Button variant="outline" size="sm">
                  미래가치
                </Button>
              </TableHead>
              <TableHead>상한선</TableHead>
              <TableHead>하한선</TableHead>
              <TableHead>
                <Button variant="outline" size="sm">
                  AI예측
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(14)].map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    <TableCell colSpan={14}>
                      <div style={{ height: paddingTop }} />
                    </TableCell>
                  </TableRow>
                )}
                {virtualItems.map((vi) => {
                  const item = filteredData[vi.index];
                  const profitLoss = Number(item.evlu_pfls_amt || 0);
                  const profitLossColor =
                    profitLoss >= 0 ? "text-blue-500" : "text-red-500";

                  return (
                    <TableRow
                      key={item.stock}
                      data-index={vi.index}
                      onClick={() =>
                        onRowClick({
                          exchange: item.exchange,
                          stock: item.stock,
                        })
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <Avatar className="border w-6 h-6">
                          <AvatarImage
                            src={`https://s3-symbol-logo.tradingview.com/${item.logoid}.svg`}
                            alt={item.stock}
                          />
                          <AvatarFallback>{item.stock}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.stock}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={item.prdt_name}
                      >
                        {item.prdt_name || "-"}
                      </TableCell>
                      <TableCell>
                        {Number(item.hldg_qty || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${Number(item.pchs_avg_pric || 0).toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={getPriceColor(
                          item.close,
                          item.bbLower,
                          item.bbUpper
                        )}
                      >
                        ${Number(item.prpr || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${Number(item.evlu_amt || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className={profitLossColor}>
                        ${profitLoss.toLocaleString()}
                      </TableCell>
                      <TableCell className={profitLossColor}>
                        {Number(item.evlu_pfls_rt || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        {item.person_count > 0 ? (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                {item.person_count}명
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom">
                              <SheetHeader>
                                <SheetTitle>{item.stock} 투자자</SheetTitle>
                                <SheetDescription>
                                  {item.person_count}명의 투자자가 이 종목을
                                  보유하고 있습니다.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="max-h-[70vh] overflow-auto px-4 flex flex-col gap-2 pb-4">
                                {item.person
                                  .sort((a, b) => a.no - b.no)
                                  .map((p) => (
                                    <div
                                      key={p.no}
                                      className="flex justify-between"
                                    >
                                      <div>{p.name}</div>
                                      <div>{p.ratio}</div>
                                    </div>
                                  ))}
                              </div>
                            </SheetContent>
                          </Sheet>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={getFutureValueColor(
                          item.dcf_vs_market_cap_pct
                        )}
                      >
                        {item.dcf_vs_market_cap_pct > 0
                          ? `${Math.floor(item.dcf_vs_market_cap_pct)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.bbUpper > 0
                          ? `$${Math.floor(item.bbUpper)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.bbLower > 0
                          ? `$${Math.floor(item.bbLower)}`
                          : "-"}
                      </TableCell>
                      <TableCell className={getAIPredictionColor(item.ai)}>
                        {item.ai > 0 ? `${(item.ai * 100).toFixed(2)}%` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow>
                    <TableCell colSpan={14}>
                      <div style={{ height: paddingBottom }} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default held;
