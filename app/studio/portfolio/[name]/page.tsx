"use client";
import * as React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, LabelList } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface PortfolioItem { code: string; ratio: string }
interface PersonDetail { name: string; totalValue: string | null; portfolio: PortfolioItem[] }

function parseRatio(r: string) {
  const n = parseFloat(r.replace(/%/g, ''));
  return isNaN(n) ? 0 : n;
}

export default function PortfolioDetailPage() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { data, isLoading, error } = useQuery<PersonDetail>({
    queryKey: ['dataroma-person', name],
    queryFn: async () => {
      const res = await fetch(`/api/dataroma/person?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('로드 실패');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1h
  });

  const chartData = React.useMemo(() => {
    if (!data?.portfolio) return [] as { code: string; value: number; fill: string }[];
    // pick top 12 by ratio, group rest into Other
    const items = [...data.portfolio]
      .filter(p => p.code && p.ratio)
      .map(p => ({ code: p.code, value: parseRatio(p.ratio) }))
      .sort((a,b) => b.value - a.value);
    const top = items.slice(0, 12);
    const rest = items.slice(12);
    const restSum = rest.reduce((acc, cur) => acc + cur.value, 0);
    const palette = [
      'var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)','var(--chart-5)',
      'var(--chart-6, hsl(var(--primary)))','var(--chart-7, hsl(var(--secondary)))','var(--chart-8, hsl(var(--muted)))',
      'var(--chart-9, #4ade80)','var(--chart-10, #fbbf24)','var(--chart-11, #60a5fa)','var(--chart-12, #f87171)'
    ];
    const withColors = top.map((t, idx) => ({ ...t, fill: palette[idx % palette.length] }));
    if (restSum > 0) withColors.push({ code: 'Other', value: parseFloat(restSum.toFixed(2)), fill: 'var(--chart-other, #a1a1aa)' });
    return withColors;
  }, [data]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const cfg: ChartConfig = { value: { label: '비중(%)' } };
    chartData.forEach(d => { cfg[d.code] = { label: d.code }; });
    return cfg;
  }, [chartData]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio: {name}</h1>
        {data?.totalValue && <p className="text-muted-foreground text-sm">Total Value: {data.totalValue}</p>}
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      {data && (
        <>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Pie Chart</CardTitle>
              <CardDescription>Top holdings by portfolio weight</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 pt-4">
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[360px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="code" hideLabel />} />
                  <Pie data={chartData} dataKey="value" nameKey="code" strokeWidth={1}>
                    <LabelList dataKey="code" className="fill-background" stroke="none" fontSize={11} />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead className="w-32">Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.portfolio.map(p => (
                  <TableRow key={p.code + p.ratio}>
                    <TableCell className="font-medium">{p.code}</TableCell>
                    <TableCell>{p.ratio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
