"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useStudioData } from "@/hooks/useStudioData";

// data shapes are inferred at runtime from the dataroma base API

export default function StudioHomePage() {
  const router = useRouter();
  const {
    dataromaBasedOnPerson,
    dataromaBasedOnStock,
    dataromaLoading,
    dataromaError,
  } = useStudioData();

  // sorting state
  const [personSort, setPersonSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);
  const [stockSort, setStockSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(null);

  const toggleSort = (
    current: { key: string; dir: "asc" | "desc" } | null,
    key: string
  ): { key: string; dir: "asc" | "desc" } => {
    if (!current || current.key !== key) return { key, dir: "asc" };
    return { key, dir: current.dir === "asc" ? "desc" : "asc" } as {
      key: string;
      dir: "asc" | "desc";
    };
  };

  const sortedPersons = React.useMemo(() => {
    if (!personSort) return dataromaBasedOnPerson;
    const arr = [...dataromaBasedOnPerson] as unknown[];
    const key = personSort.key;
    arr.sort((a: unknown, b: unknown) => {
      const A = (a as Record<string, unknown>)[key];
      const B = (b as Record<string, unknown>)[key];
      if (A == null && B == null) return 0;
      if (A == null) return personSort.dir === "asc" ? -1 : 1;
      if (B == null) return personSort.dir === "asc" ? 1 : -1;
      if (typeof A === "number" && typeof B === "number")
        return personSort.dir === "asc"
          ? (A as number) - (B as number)
          : (B as number) - (A as number);
      return personSort.dir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
    return arr;
  }, [dataromaBasedOnPerson, personSort]);

  const sortedStocks = React.useMemo(() => {
    if (!stockSort) return dataromaBasedOnStock;
    const arr = [...dataromaBasedOnStock] as unknown[];
    const key = stockSort.key;
    arr.sort((a: unknown, b: unknown) => {
      const A = (a as Record<string, unknown>)[key];
      const B = (b as Record<string, unknown>)[key];
      if (A == null && B == null) return 0;
      if (A == null) return stockSort.dir === "asc" ? -1 : 1;
      if (B == null) return stockSort.dir === "asc" ? 1 : -1;
      if (typeof A === "number" && typeof B === "number")
        return stockSort.dir === "asc"
          ? (A as number) - (B as number)
          : (B as number) - (A as number);
      return stockSort.dir === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
    return arr;
  }, [dataromaBasedOnStock, stockSort]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dataroma Base</h1>
        <p className="text-muted-foreground text-sm">
          슈퍼 투자자 포트폴리오 집계 (최초 1회 로드, 캐시 유지)
        </p>
      </div>
      {dataromaLoading && (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      )}
      {!!dataromaError && (
        <p className="text-sm text-destructive">
          {dataromaError instanceof Error
            ? dataromaError.message
            : "데이터를 불러오는 중 오류가 발생했습니다."}
        </p>
      )}
      {!dataromaLoading && !dataromaError && (
        <Tabs defaultValue="person" className="w-full">
          <TabsList>
            <TabsTrigger value="person">
              Based on Person ({dataromaBasedOnPerson.length})
            </TabsTrigger>
            <TabsTrigger value="stock">
              Based on Stock ({dataromaBasedOnStock.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="person" className="mt-2">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setPersonSort((prev) => toggleSort(prev, "no"))
                        }
                      >
                        No
                        {personSort?.key === "no"
                          ? personSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setPersonSort((prev) => toggleSort(prev, "name"))
                        }
                      >
                        Name
                        {personSort?.key === "name"
                          ? personSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setPersonSort((prev) =>
                            toggleSort(prev, "totalValueNum")
                          )
                        }
                      >
                        Total Value
                        {personSort?.key === "totalValueNum"
                          ? personSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPersons.map((r: unknown) => {
                    const row = r as {
                      no: number;
                      name: string;
                      dcf_vs_market_cap_pct?: string | number;
                      totalValue?: string | null;
                    };
                    return (
                      <TableRow
                        key={row.no}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          router.push(
                            `/studio/portfolio/${encodeURIComponent(row.name)}`
                          )
                        }
                      >
                        <TableCell>{row.no}</TableCell>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell>{row.totalValue || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="stock" className="mt-2">
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setStockSort((prev) => toggleSort(prev, "stock"))
                        }
                      >
                        Stock
                        {stockSort?.key === "stock"
                          ? stockSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setStockSort((prev) =>
                            toggleSort(prev, "person_count")
                          )
                        }
                      >
                        Person Count
                        {stockSort?.key === "person_count"
                          ? stockSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setStockSort((prev) =>
                            toggleSort(prev, "dcf_vs_market_cap_pct")
                          )
                        }
                      >
                        DCF
                        {stockSort?.key === "dcf_vs_market_cap_pct"
                          ? stockSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-2"
                        onClick={() =>
                          setStockSort((prev) => toggleSort(prev, "sum_ratio"))
                        }
                      >
                        Sum Ratio
                        {stockSort?.key === "sum_ratio"
                          ? stockSort.dir === "asc"
                            ? " ▲"
                            : " ▼"
                          : ""}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((r: unknown) => {
                    const row = r as {
                      stock: string;
                      person_count: number;
                      dcf_vs_market_cap_pct?: string | number;
                      sum_ratio: string;
                    };
                    return (
                      <TableRow key={row.stock}>
                        <TableCell className="font-medium">
                          {row.stock}
                        </TableCell>
                        <TableCell>{row.person_count}</TableCell>
                        <TableCell>
                          {row.dcf_vs_market_cap_pct || "-"}%
                        </TableCell>
                        <TableCell>{row.sum_ratio}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
