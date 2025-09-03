'use client';
import * as React from 'react';
import Link from 'next/link';
import useDataromaBase from '@/hooks/useDataromaBase';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PortfolioEntry = { code?: string; pdno?: string };
type Person = { name?: string; no?: number; portfolio?: PortfolioEntry[] };
type Comment = { user?: { displayName?: string; name?: string }; body?: string };
type StockSummary = { stock?: string; person_count?: number; sum_ratio?: string };
type NewsResp = { productCode?: string; comments?: Comment[] } | null;

export default function StockPage({ params }: { params: { code: string } }) {
  const code = (params.code || '').toString().toUpperCase();
  const { data: base } = useDataromaBase();
  const { data: news } = useQuery<NewsResp>({ queryKey: ['newsCommunity', code], queryFn: async () => (await fetch(`/api/newsCommunity?query=${encodeURIComponent(code)}`)).json(), enabled: !!code });

  const normalizedCode = React.useMemo(() => (String(code || '').trim().toUpperCase()), [code]);

  const investors = React.useMemo(() => {
    const persons = (base?.based_on_person ?? []) as Person[];
    return persons.filter((p: Person) => {
      const portfolio = p.portfolio ?? [];
      return portfolio.some((it: PortfolioEntry) => {
        const candidate = String(it.code || it.pdno || '').trim().toUpperCase();
        return candidate === normalizedCode;
      });
    });
  }, [base, normalizedCode]);

  const stockSummary = React.useMemo(() => {
    const stocks = (base?.based_on_stock ?? []) as StockSummary[];
    return stocks.find(s => String(s.stock || '').trim().toUpperCase() === normalizedCode);
  }, [base, normalizedCode]);

  return (
    <div className="mx-auto max-w-4xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">종목: {code}</h1>
        <div className="flex items-center gap-2">
          <Link href="/studio/home" className="text-sm text-muted-foreground">Studio home</Link>
          <Badge>{investors.length} investors</Badge>
        </div>
      </div>

      <Tabs defaultValue="investors">
        <TabsList>
          <TabsTrigger value="investors">투자자 리스트</TabsTrigger>
          <TabsTrigger value="chart">종목 차트</TabsTrigger>
          <TabsTrigger value="detail">종목 상세</TabsTrigger>
          <TabsTrigger value="analysis">종목 분석</TabsTrigger>
          <TabsTrigger value="discussion">종목 토론</TabsTrigger>
          <TabsTrigger value="news">종목 뉴스</TabsTrigger>
        </TabsList>

        <TabsContent value="investors">
          <Card>
            <CardHeader>
              <CardTitle>투자자 리스트</CardTitle>
            </CardHeader>
            <CardContent>
              {investors.length === 0 ? (
                stockSummary ? (
                  <div className="space-y-2">
                    <div className="text-sm">요약: {stockSummary.stock} — {stockSummary.person_count ?? 0}명 보유</div>
                    <div className="text-xs text-muted-foreground">합계 비중: {stockSummary.sum_ratio ?? 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">based_on_person 데이터에는 투자자 리스트가 없지만 based_on_stock 요약이 존재합니다.</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">해당 종목을 보유한 투자자가 없습니다.</div>
                )
              ) : (
                <ul className="space-y-2">
                  {investors.map((p: Person) => (
                    <li key={p.name} className="flex items-center justify-between border rounded p-2">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.no ? `#${p.no}` : ''}</div>
                      </div>
                      <Link href={`/studio/portfolio/${encodeURIComponent(String(p.name || ''))}`} className="text-sm text-primary">상세</Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>종목 차트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">차트 placeholder</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <CardTitle>종목 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs">{JSON.stringify({ code }, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>종목 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">분석 placeholder</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>종목 토론</CardTitle>
            </CardHeader>
            <CardContent>
              {news?.comments?.length ? (
                (news.comments || []).map((c: Comment, i: number) => (
                  <div key={i} className="border rounded p-2 mb-2">
                    <div className="text-sm font-medium">{c.user?.displayName ?? c.user?.name ?? '익명'}</div>
                    <div className="text-xs text-muted-foreground">{c.body}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">토론(댓글) 데이터가 없습니다.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>관련 뉴스</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs">{JSON.stringify(news ?? { message: 'no data' }, null, 2)}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
