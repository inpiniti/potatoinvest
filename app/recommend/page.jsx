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
// NOTE: ScrollArea는 부모 높이를 고정해야만 스크롤이 작동합니다.
// 본 시트 목록은 "최대 높이 제한 + 내용이 넘칠 때만 스크롤" 요구라서
// 단순 div + overflow-auto로 구현해 빈 공간 없이 동작하도록 합니다.

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Skeleton } from "@/components/ui/skeleton";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInvestor } from "@/hooks/useInvestor";

const recommend = () => {
  // 루트에서 선조회된 투자자 데이터를 재사용 (캐시에서 로드, 추가 네트워크 요청 없음)
  const { stocks: data, isLoading } = useInvestor({ enabled: true });

  // 현재가격이 상한선 보다 크면 빨간색, 하한선 보다 작으면 파란색
  const getPriceColor = (price, lower, upper) => {
    if (price >= upper) return "text-red-400";
    if (price <= lower) return "text-blue-400";
    return "";
  };

  // 미래가치가 100% 이하인 종목은 text-red-50
  // 미래가치가 100% 이상인 종목은 text-red-100
  // 미래가치가 200% 이상인 종목은 text-red-200
  // 미래가치가 300% 이상인 종목은 text-red-300
  // 미래가치가 500% 이상인 종목은 text-red-400
  // 미래가치가 700% 이상인 종목은 text-red-500
  // 미래가치가 1000% 이상인 종목은 text-red-600
  const getFutureValueColor = (value) => {
    if (value >= 1000) return "text-red-600";
    if (value >= 700) return "text-red-500";
    if (value >= 500) return "text-red-400";
    if (value >= 300) return "text-red-300";
    if (value >= 200) return "text-red-200";
    if (value >= 100) return "text-red-100";
    return "text-red-50";
  };

  // 단기 예측이 50이하는 text-red-50
  // 단기 예측이 51~52 text-red-100
  // 단기 예측이 53~54 text-red-200
  // 단기 예측이 55~57 text-red-300
  // 단기 예측이 58~60 text-red-400
  // 단기 예측이 61~65 text-red-500
  // 단기 예측이 66 이상 text-red-600
  const getAIPredictionColor = (value) => {
    if (value * 100 >= 66) return "text-red-600";
    if (value * 100 >= 61) return "text-red-500";
    if (value * 100 >= 58) return "text-red-400";
    if (value * 100 >= 55) return "text-red-300";
    if (value * 100 >= 53) return "text-red-200";
    if (value * 100 >= 51) return "text-red-100";
    return "text-red-50";
  };

  const [selectedTab, setSelectedTab] = useState("all");

  const filteredData = useMemo(() => {
    return data?.filter((item) => {
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
  }, [data, selectedTab]);

  // Virtualization setup
  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredData?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // px per row (adjust if row height changes)
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
  // /detail/[stock]
  const onRowClick = ({ exchange, stock }) => {
    window.location.href = `/detail/${exchange}/${stock}`;
  };

  return (
    <div>
      <Tabs
        value={selectedTab}
        onValueChange={(e) => {
          console.log(e);
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
              <TableHead>종목</TableHead>
              <TableHead>투자자 수</TableHead>
              <TableHead>
                <Button variant="outline" size="sm">
                  미래 내재가치
                </Button>
              </TableHead>
              <TableHead>상한선</TableHead>
              <TableHead>현재가격</TableHead>
              <TableHead>하한선</TableHead>
              <TableHead>
                <Button variant="outline" size="sm">
                  AI단기예측
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(20)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(8)].map((_, index) => (
                    <TableCell key={index}>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {paddingTop > 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div style={{ height: paddingTop }} />
                    </TableCell>
                  </TableRow>
                )}
                {virtualItems.map((vi) => {
                  const item = filteredData[vi.index];
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
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell
                        className={getFutureValueColor(
                          item.dcf_vs_market_cap_pct
                        )}
                      >
                        {Math.floor(item.dcf_vs_market_cap_pct || 0)}%
                      </TableCell>
                      <TableCell>${Math.floor(item.bbUpper)}</TableCell>
                      <TableCell
                        className={getPriceColor(
                          item.close,
                          item.bbLower,
                          item.bbUpper
                        )}
                      >
                        ${Math.floor(item.close)}
                      </TableCell>
                      <TableCell>${Math.floor(item.bbLower)}</TableCell>
                      <TableCell className={getAIPredictionColor(item.ai)}>
                        {(item.ai * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paddingBottom > 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
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

export default recommend;
