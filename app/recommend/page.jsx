'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
// NOTE: ScrollArea는 부모 높이를 고정해야만 스크롤이 작동합니다.
// 본 시트 목록은 "최대 높이 제한 + 내용이 넘칠 때만 스크롤" 요구라서
// 단순 div + overflow-auto로 구현해 빈 공간 없이 동작하도록 합니다.

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Skeleton } from '@/components/ui/skeleton';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInvestor } from '@/hooks/useInvestor';

const recommend = () => {
  // 루트에서 선조회된 투자자 데이터를 재사용 (캐시에서 로드, 추가 네트워크 요청 없음)
  const { stocks: data, isLoading } = useInvestor({ enabled: true });

  // 현재가격이 상한선 보다 크면 빨간색, 하한선 보다 작으면 파란색
  const getPriceColor = (price, lower, upper) => {
    if (price >= upper) return 'text-red-400';
    if (price <= lower) return 'text-blue-400';
    return '';
  };

  // 미래가치가 100% 이하인 종목은 text-red-50
  // 미래가치가 100% 이상인 종목은 text-red-100
  // 미래가치가 200% 이상인 종목은 text-red-200
  // 미래가치가 300% 이상인 종목은 text-red-300
  // 미래가치가 500% 이상인 종목은 text-red-400
  // 미래가치가 700% 이상인 종목은 text-red-500
  // 미래가치가 1000% 이상인 종목은 text-red-600
  const getFutureValueColor = (value) => {
    if (value >= 1000) return 'text-red-600';
    if (value >= 700) return 'text-red-500';
    if (value >= 500) return 'text-red-400';
    if (value >= 300) return 'text-red-300';
    if (value >= 200) return 'text-red-200';
    if (value >= 100) return 'text-red-100';
    return 'text-red-50';
  };

  // 단기 예측이 50이하는 text-red-50
  // 단기 예측이 51~52 text-red-100
  // 단기 예측이 53~54 text-red-200
  // 단기 예측이 55~57 text-red-300
  // 단기 예측이 58~60 text-red-400
  // 단기 예측이 61~65 text-red-500
  // 단기 예측이 66 이상 text-red-600
  const getAIPredictionColor = (value) => {
    if (value * 100 >= 66) return 'text-red-600';
    if (value * 100 >= 61) return 'text-red-500';
    if (value * 100 >= 58) return 'text-red-400';
    if (value * 100 >= 55) return 'text-red-300';
    if (value * 100 >= 53) return 'text-red-200';
    if (value * 100 >= 51) return 'text-red-100';
    return 'text-red-50';
  };

  const [selectedTab, setSelectedTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    return data?.filter((item) => {
      if (selectedTab === 'buy') {
        return (
          //item.ai >= 0.5 &&
          //item.dcf_vs_market_cap_pct >= 300 &&
          item.close <= item.bbLower &&
          item.rsi < 30 &&
          item.sma20 > item.sma50 &&
          item.sma50 > item.sma100 &&
          item.sma100 > item.sma200
        );
      }
      if (selectedTab === 'sell') {
        return item.ai < 0.5 && item.close > item.bbUpper;
      }
      if (searchText) {
        return item.stock.toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });
  }, [data, selectedTab, searchText]);

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
      <div className="flex items-center p-2 gap-2">
        <Tabs
          value={selectedTab}
          onValueChange={(e) => {
            console.log(e);
            setSelectedTab(e);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="sell">매도추천</TabsTrigger>
            <TabsTrigger value="buy">매수추천</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
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
                <Sheet onClick={(e) => e.stopPropagation()}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      미래 내재가치
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SheetHeader>
                      <SheetTitle>미래 내재가치</SheetTitle>
                      <SheetDescription>
                        미래에 발생할 현금 흐름을 현재 가치로 할인하여 계산한
                        기업의 본질적인 가치
                      </SheetDescription>
                    </SheetHeader>
                    <div className="max-h-[70vh] overflow-auto px-4 flex flex-col gap-2 pb-4">
                      <p className="text-sm font-medium">
                        미래 내재가치(Discounted Cash Flow - DCF) 계산 원리
                      </p>
                      <p className="text-xs text-muted-foreground">
                        이 값은 회사가 앞으로 벌어들일 것으로 예상되는
                        현금흐름(Free Cash Flow)을 할인해 현재 가치로 환산한
                        추정치입니다. 주요 단계는 다음과 같습니다:
                      </p>
                      <ul className="pl-4 text-xs list-disc text-muted-foreground">
                        <li>
                          과거 재무지표로부터 현재의 FCF(자유현금흐름)를
                          추정합니다.
                        </li>
                        <li>
                          연간 성장률(g)을 추정하여 향후 N년간의 FCF를
                          예상합니다.
                        </li>
                        <li>
                          할인율(r)을 적용해 각 연도의 현금흐름을 현재가치로
                          할인합니다.
                        </li>
                        <li>
                          N년 이후의 영구가치(terminal value)는 Gordon Growth
                          등으로 계산해 할인합니다.
                        </li>
                        <li>
                          모든 현재가치를 합산해 기업의 내재가치를 산출합니다.
                          화면에는 이 값을 시가총액과 비교한
                          비율(dcf_vs_market_cap_pct)을 함께 제공합니다.
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        주의: 입력 가정(성장률, 할인율, FCF 추정 등)에
                        민감하므로 절대적인 절대값으로 해석하기보다는 상대적
                        비교(동종업종, 과거 값 대비 변화)를 권장합니다.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              </TableHead>
              <TableHead>상한선</TableHead>
              <TableHead>현재가격</TableHead>
              <TableHead>하한선</TableHead>
              <TableHead>RSI</TableHead>
              <TableHead>이평선</TableHead>
              <TableHead>
                <Sheet onClick={(e) => e.stopPropagation()}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      AI단기예측
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SheetHeader>
                      <SheetTitle>AI단기예측</SheetTitle>
                      <SheetDescription>
                        deep learning 기반의 AI가 단기 주가 상승 확률을 예측한
                        수치
                      </SheetDescription>
                    </SheetHeader>
                    <div className="max-h-[70vh] overflow-auto px-4 flex flex-col gap-2 pb-4">
                      <p className="text-sm font-medium">
                        AI 단기예측(모델 개요 및 원리)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        본 서비스의 단기 예측은 여러 개의 딥러닝( TensorFlow )
                        모델을 앙상블하여, 각 종목의 단기(일수 기준) 주가 상승
                        확률을 산출합니다. 핵심 사항은 다음과 같습니다:
                      </p>
                      <ul className="pl-4 text-xs list-disc text-muted-foreground">
                        <li>
                          입력 피처: 가격 관련 지표(종가, 변동성, 볼린저 등),
                          퍼포먼스(주/월/분기/연간), 거래량 변화, 재무 지표 일부
                          등을 사용합니다.
                        </li>
                        <li>
                          전처리: 누락값 처리 및 수치형 표준화/정규화를
                          수행합니다 (preprocessData 참조).
                        </li>
                        <li>
                          모델: 여러 학습된 신경망 모델을 병렬로 로드하여 각
                          모델의 예측을 평균(또는 가중평균)해 최종 확률을
                          도출합니다.
                        </li>
                        <li>
                          출력 해석: 출력값은 '상승 확률'을 의미하며 0~1 범위로
                          표현됩니다. (예: 0.75 → 75% 확률로 단기 상승 가능성)
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        한계 및 주의사항: 모델은 과거 데이터에 기반해 학습되므로
                        과거와 다른 시장 환경(유동성, 뉴스, 이벤트)에서는 성능이
                        저하될 수 있습니다. 또한 확률은 절대적 확신이 아닌
                        참고용 지표로 활용하시기 바랍니다.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
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
                        <Sheet onClick={(e) => e.stopPropagation()}>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.person_count}명
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="bottom"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                      <TableCell>{Math.floor(item.rsi)}</TableCell>
                      <TableCell>
                        {item.sma20 > item.sma50 &&
                          item.sma50 > item.sma100 &&
                          item.sma100 > item.sma200
                          ? '상승중'
                          : '-'}
                      </TableCell>
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
