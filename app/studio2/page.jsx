"use client";
import Section from "./components/Section";
import LoginSection from "./components/LoginSection";
import AccountsSectionLite from "./components/AccountsSectionLite";
import AccountAuthStatus from "./components/AccountAuthStatus";
import MobileS from "./components/MobileS";
import MobileM from "./components/MobileM";
import MobileL from "./components/MobileL";
import Tablet from "./components/Tablet";
import Laptop from "./components/Laptop";
import LaptopL from "./components/LaptopL";
import FourK from "./components/4K";

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
        if (s.login) {
          return <LoginSection key={s.key} />;
        }
        if (s.accounts) {
          return <AccountsSectionLite key={s.key} />;
        }
        if (s.accountAuth) {
          return <AccountAuthStatus key={s.key} />;
        }
        const className =
          s.wide && columns >= 3
            ? columns === 3
              ? "col-span-2"
              : columns >= 4
              ? "col-span-2"
              : ""
            : "";
        return (
          <Section
            key={s.key}
            title={s.title}
            description={s.description}
            action={s.action}
            className={className}
          >
            {s.body}
          </Section>
        );
      })}
    </div>
  );
}

export default function Page() {
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
