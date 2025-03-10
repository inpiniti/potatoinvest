'use client';

import IStock from '@/app/interface/IStock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useQuery } from '@tanstack/react-query';
const RealTime = () => {
  const getTodos = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Set a custom timeout (e.g., 60 seconds)
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/hello', { signal });
      clearTimeout(timeoutId); // Clear the timeout if the request completes in time

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };

  const query = useQuery({ queryKey: ['todos'], queryFn: getTodos });

  return (
    <div className="rounded-sm overflow-hidden border bg-white">
      <h1 className="border-b px-4 py-2 bg-neutral-50">Real Time Page</h1>
      <Table className="rounded-lg p-4">
        <TableHeader>
          <TableRow>
            <TableHead>로고</TableHead>
            <TableHead>종목코드</TableHead>
            <TableHead>종가</TableHead>
            <TableHead>1개월 성과</TableHead>
            <TableHead>3개월 성과</TableHead>
            <TableHead className="hidden sm:table-cell">6개월 성과</TableHead>
            <TableHead className="hidden sm:table-cell">1년 성과</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query?.data?.slice(0, 100).map((live: IStock) => (
            <TableRow key={live.name}>
              <TableCell>
                <Avatar className="border">
                  <AvatarImage
                    src={`https://s3-symbol-logo.tradingview.com/${live.logoid}--big.svg`}
                    alt="@radix-vue"
                  />
                  <AvatarFallback>
                    {live.description?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{live.name}</TableCell>
              <TableCell
                className={
                  Number(live.change) < 0 ? 'text-blue-400' : 'text-red-400'
                }
              >
                {live.close} ({Number(live.change).toFixed(2)}%)
              </TableCell>
              <TableCell
                className={
                  Number(live.perf_1_m) < 0 ? 'text-blue-400' : 'text-red-400'
                }
              >
                {Number(live.perf_1_m).toFixed(2)}%
              </TableCell>
              <TableCell
                className={
                  Number(live.perf_3_m) < 0 ? 'text-blue-400' : 'text-red-400'
                }
              >
                {Number(live.perf_3_m).toFixed(2)}%
              </TableCell>
              <TableCell
                className={`${
                  Number(live.perf_6_m) < 0 ? 'text-blue-400' : 'text-red-400'
                }  hidden sm:table-cell`}
              >
                {Number(live.perf_6_m).toFixed(2)}%
              </TableCell>
              <TableCell
                className={`${
                  Number(live.perf_y) < 0 ? 'text-blue-400' : 'text-red-400'
                }  hidden sm:table-cell`}
              >
                {Number(live.perf_y).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RealTime;
