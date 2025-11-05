// /api/dataroma/base?withDetails=true 호출
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from '@/components/ui/skeleton';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { useEffect, useState } from 'react';

const recommend = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch('/api/dataroma/base?withDetails=true');
      const data = await response.json();
      setData(data?.based_on_stock);
      setLoading(false);
    };
    fetchData();
  }, []);

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>로고</TableHead>
          <TableHead>종목</TableHead>
          <TableHead>투자자 수</TableHead>
          <TableHead>미래 내재가치</TableHead>
          <TableHead>상한선</TableHead>
          <TableHead>현재가격</TableHead>
          <TableHead>하한선</TableHead>
          <TableHead>AI단기예측</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? [...Array(20)].map(() => (
              <TableRow>
                {[...Array(8)].map(() => (
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : data.map((item) => (
              <TableRow key={item.stock}>
                <TableCell>
                  <Avatar className="border w-6 h-6">
                    <AvatarImage
                      src={`https://s3-symbol-logo.tradingview.com/${item.logoid}--big.svg`}
                      alt={item.stock}
                    />
                    <AvatarFallback>{item.stock}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.person_count}</TableCell>
                <TableCell
                  className={getFutureValueColor(item.dcf_vs_market_cap_pct)}
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
            ))}
      </TableBody>
    </Table>
  );
};

export default recommend;
