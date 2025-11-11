"use client";

import { getLogoUrl } from "@/app/page/log/utils/logoUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { selectedStockStore } from "@/store/selectedStockStore";

export function AppSidebar() {
  const [dataromaBasedOnStock, setDataromaBasedOnStock] = useState([]);
  const { selectedStock, setSelectedStock } = selectedStockStore();

  const dataromaQuery = useQuery({
    queryKey: ["studio", "dataroma-base"],
    queryFn: async () => {
      const res = await fetch("/api/dataroma/base?withDetails=true", {
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Dataroma 데이터를 불러오지 못했습니다.");
      }
      return await res.json();
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // use refetch result but normalize to based_on_stock array
    dataromaQuery.refetch().then((result) => {
      if (result && result.data) {
        const payload = result.data;
        setDataromaBasedOnStock(
          Array.isArray(payload.based_on_stock) ? payload.based_on_stock : []
        );
      }
    });
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="border-b">감자증권</SidebarHeader>
      <SidebarContent className="!gap-0">
        {dataromaBasedOnStock?.map((item, index) => {
          const logoUrl = getLogoUrl(item);

          return (
            <Item
              key={index}
              onClick={() =>
                setSelectedStock({
                  stock: item.stock,
                  market: item.market,
                  exchange: item.exchange,
                })
              }
              className={`cursor-pointer hover:bg-neutral-100 ${
                (typeof selectedStock === "string"
                  ? selectedStock
                  : selectedStock?.stock) === item.stock
                  ? "bg-neutral-200"
                  : ""
              }`}
            >
              <ItemMedia>
                <Avatar className="w-7 h-7 rounded-2xl">
                  <AvatarImage src={logoUrl} className={`object-contain`} />
                  <AvatarFallback
                    className={`text-md font-bold rounded-2xl`}
                  ></AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.stock}</ItemTitle>
                <ItemDescription>{item.dcf_vs_market_cap_pct}%</ItemDescription>
              </ItemContent>
              <ItemActions>{item.person_count}</ItemActions>
            </Item>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t">
        {typeof selectedStock === "string"
          ? selectedStock
          : selectedStock?.stock || ""}
      </SidebarFooter>
    </Sidebar>
  );
}
