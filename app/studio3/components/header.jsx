"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { selectedStockStore } from "@/store/selectedStockStore";

const Header = () => {
  const { selectedStock } = selectedStockStore();
  return (
    <header className="h-12 flex overflow-hidden">
      <SidebarTrigger />
      {selectedStock.market}:{selectedStock.exchange}:{selectedStock.stock}
    </header>
  );
};

export default Header;
