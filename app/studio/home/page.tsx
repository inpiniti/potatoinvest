"use client";
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import * as React from 'react';

interface PersonRow { no: number; name: string; totalValue?: string | null }
interface StockRow { stock: string; person_count: number; sum_ratio: string }

export default function StudioHomePage() {
  const { data, isLoading, error } = useQuery<{ based_on_person: PersonRow[]; based_on_stock: StockRow[] }>({
    queryKey: ['dataroma-base'],
    queryFn: async () => {
      const res = await fetch('/api/dataroma/base');
      if (!res.ok) throw new Error('데이터 로드 실패');
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dataroma Base</h1>
        <p className="text-muted-foreground text-sm">슈퍼 투자자 포트폴리오 집계 (최초 1회 로드, 캐시 유지)</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      {data && (
        <Tabs defaultValue="person" className="w-full">
          <TabsList>
            <TabsTrigger value="person">Based on Person ({data.based_on_person.length})</TabsTrigger>
            <TabsTrigger value="stock">Based on Stock ({data.based_on_stock.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="person" className="mt-2">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.based_on_person.map((r) => (
                    <TableRow key={r.no}>
                      <TableCell>{r.no}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.totalValue || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="stock" className="mt-2">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead>Person Count</TableHead>
                    <TableHead>Sum Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.based_on_stock.map((r) => (
                    <TableRow key={r.stock}>
                      <TableCell className="font-medium">{r.stock}</TableCell>
                      <TableCell>{r.person_count}</TableCell>
                      <TableCell>{r.sum_ratio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
