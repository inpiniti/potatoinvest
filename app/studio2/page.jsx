"use client";
import { useEffect } from "react";
import Section from "./components/Section";
import LoginSection from "./components/LoginSection";
import AccountsSectionLite from "./components/AccountsSectionLite";
import AccountAuthStatus from "./components/AccountAuthStatus";
import InvestorListSection from "./components/InvestorListSection";
import StockListSection from "./components/StockListSection";
import AssetInfoSection from "./components/AssetInfoSection";
import HoldingsSection from "./components/HoldingsSection";
import MobileS from "./components/MobileS";
import MobileM from "./components/MobileM";
import MobileL from "./components/MobileL";
import Tablet from "./components/Tablet";
import Laptop from "./components/Laptop";
import LaptopL from "./components/LaptopL";
import FourK from "./components/4K";
import usePortfolio from "@/hooks/usePortfolio";
import useAssets from "@/hooks/useAssets";

// 재사용할 Section 데이터 (타이틀/설명/본문)
const sections = [
  {
    key: "login",
    login: true,
  },
  {
    key: "accounts",
    accounts: true,
  },
  {
    key: "accountAuth",
    accountAuth: true,
  },
  {
    key: "investors",
    investors: true,
    fullWidth: true, // 가로 전체 차지
  },
  {
    key: "stocks",
    stocks: true,
    rowSpan: 2, // 세로 2칸 차지
  },
  {
    key: "assetInfo",
    assetInfo: true,
  },
  {
    key: "holdings",
    holdings: true,
  },
  {
    key: "revenue",
    title: "",
    description: "Total Revenue",
    body: (
      <>
        <h1 className="text-2xl font-semibold">$15,231.89</h1>
        <p className="text-sm text-emerald-500 font-medium">
          +20.1% from last month
        </p>
      </>
    ),
  },
  {
    key: "subs",
    title: "",
    description: "Subscriptions",
    action: "View More",
    body: (
      <>
        <p className="text-xl font-semibold">+2,350</p>
        <p className="text-sm text-emerald-500 font-medium">
          +180.1% from last month
        </p>
      </>
    ),
  },
  {
    key: "move",
    title: "Move Goal",
    body: <p>Set your daily activity goal.</p>,
  },
  {
    key: "create",
    title: "Create an account",
    description:
      "Enter your email to create an account and access all features.",
    body: <p>This is the content of my section.</p>,
    wide: true,
  },
  {
    key: "misc1",
    title: "My Section",
    body: <p>This is the content of my section.</p>,
  },
  {
    key: "misc2",
    title: "My Section",
    body: <p>This is the content of my section.</p>,
  },
  {
    key: "misc3",
    title: "My Section",
    body: <p>This is the content of my section.</p>,
  },
  {
    key: "misc4",
    title: "My Section",
    body: <p>This is the content of my section.</p>,
  },
  {
    key: "misc5",
    title: "My Section",
    body: <p>This is the content of my section.</p>,
  },
];

function renderSections({ columns, stackedOnMobile = false }) {
  return (
    <div
      className={`grid gap-4 p-4 w-full max-w-screen-${
        columns >= 4 ? "xl" : "md"
      } ${
        columns === 1
          ? "grid-cols-1"
          : columns === 2
          ? "grid-cols-2"
          : columns === 3
          ? "grid-cols-3"
          : columns === 4
          ? "grid-cols-4"
          : columns === 5
          ? "grid-cols-5"
          : columns === 6
          ? "grid-cols-6"
          : columns === 7
          ? "grid-cols-7"
          : "grid-cols-8"
      }`}
    >
      {sections.map((s) => {
        // 특수 섹션 처리
        if (s.login) {
          return <LoginSection key={s.key} />;
        }
        if (s.accounts) {
          return <AccountsSectionLite key={s.key} />;
        }
        if (s.accountAuth) {
          return <AccountAuthStatus key={s.key} />;
        }
        if (s.investors) {
          return <InvestorListSection key={s.key} />;
        }
        if (s.stocks) {
          return <StockListSection key={s.key} />;
        }
        if (s.assetInfo) {
          return <AssetInfoSection key={s.key} />;
        }
        if (s.holdings) {
          return <HoldingsSection key={s.key} />;
        }

        // 일반 섹션 className 생성
        let className = "";

        // 가로 전체 차지 (fullWidth)
        if (s.fullWidth) {
          className += " col-span-full";
        }
        // wide 속성 (기존 로직)
        else if (s.wide && columns >= 3) {
          className +=
            columns === 3 ? " col-span-2" : columns >= 4 ? " col-span-2" : "";
        }

        // 세로 2칸 차지 (rowSpan)
        if (s.rowSpan === 2) {
          className += " row-span-2";
        }

        return (
          <Section
            key={s.key}
            title={s.title}
            description={s.description}
            action={s.action}
            className={className.trim()}
          >
            {s.body}
          </Section>
        );
      })}
    </div>
  );
}

export default function Page() {
  const { refetch, isLoading, allInvestors, allStocks } = usePortfolio();
  const { refetch: refetchAssets, isLoading: assetsLoading } = useAssets();

  // 페이지 진입 시 데이터가 없으면 refetch (캐시 있으면 스킵)
  useEffect(() => {
    if (!isLoading && allInvestors.length === 0 && allStocks.length === 0) {
      refetch();
    }
  }, [isLoading, allInvestors.length, allStocks.length, refetch]);

  return (
    <div className="flex w-full justify-center">
      {/* Mobile Small: 단일 컬럼 */}
      <MobileS>{renderSections({ columns: 1 })}</MobileS>
      {/* Mobile Medium: 2 컬럼 구성 */}
      <MobileM>{renderSections({ columns: 1 })}</MobileM>
      {/* Mobile Large: 2 컬럼 (여유 화면) */}
      <MobileL>{renderSections({ columns: 2 })}</MobileL>
      {/* Tablet: 3 컬럼 */}
      <Tablet>{renderSections({ columns: 3 })}</Tablet>
      {/* Laptop: 4 컬럼 */}
      <Laptop>{renderSections({ columns: 5 })}</Laptop>
      {/* Laptop Large: 5 컬럼 */}
      <LaptopL>{renderSections({ columns: 6 })}</LaptopL>
      {/* 4K: 6 컬럼 확장 */}
      <FourK>{renderSections({ columns: 7 })}</FourK>
    </div>
  );
}
