"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { selectedStockStore } from "@/store/selectedStockStore";

const Header = () => {
  const { selectedStock } = selectedStockStore();
  return (
    <header className="h-12 flex overflow-hidden">
      <SidebarTrigger />
      {selectedStock
        ? typeof selectedStock === "string"
          ? selectedStock
          : `${selectedStock.market ?? ""}:${selectedStock.exchange ?? ""}:${
              selectedStock.stock ?? ""
            }`
        : null}
    </header>
  );
};

export default Header;
