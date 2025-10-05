import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioSelectionState {
  selectedInvestor: string | null; // 선택된 자산가 ID
  selectedStock: string | null; // 선택된 종목 심볼
  selectInvestor: (id: string | null) => void;
  selectStock: (symbol: string | null) => void;
  clear: () => void;
}

export const portfolioSelectionStore = create<PortfolioSelectionState>()(
  persist(
    (set) => ({
      selectedInvestor: null,
      selectedStock: null,
      // 자산가 선택 시 종목 선택 해제
      selectInvestor: (id) =>
        set({
          selectedInvestor: id,
          selectedStock: null,
        }),
      // 종목 선택 시 자산가 선택 해제
      selectStock: (symbol) =>
        set({
          selectedInvestor: null,
          selectedStock: symbol,
        }),
      clear: () =>
        set({
          selectedInvestor: null,
          selectedStock: null,
        }),
    }),
    {
      name: "potato-portfolio-selection",
    }
  )
);

export default portfolioSelectionStore;
