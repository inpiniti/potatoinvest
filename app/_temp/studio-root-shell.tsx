"use client";

import { StrictMode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { CiLogin } from "react-icons/ci";
import { headerStore } from "@/store/headerStore";
import { StudioDataProvider } from "@/hooks/useStudioData";

const PAGE_TITLES: Record<string, string> = {
  "/": "Potato Invest",
  "/account": "계좌",
  "/held": "보유종목",
  "/recommend": "추천종목",
  "/settings": "설정",
  "/login": "로그인",
};

const DEFAULT_TITLE = "Potato Invest";

export default function StudioRootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudioDataProvider>
      <StrictMode>
        <div className="flex flex-col">
          <Header />
          <div className="pt-12">{children}</div>
        </div>
      </StrictMode>
    </StudioDataProvider>
  );
}

function Header() {
  const pathname = usePathname();
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [show, setShow] = useState(true);
  const { left, right } = headerStore();
  const lastYRef = useRef(0);

  useEffect(() => {
    if (!pathname) return;
    // Match by exact path or by first segment
    const found = PAGE_TITLES[pathname] ?? DEFAULT_TITLE;
    setTitle(found);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const last = lastYRef.current;
      const delta = Math.abs(y - last);
      if (delta < 6) return;
      if (y < 10) setShow(true);
      else setShow(y < last);
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out"
      style={{ transform: show ? "translateY(0)" : "translateY(-100%)" }}
    >
      <div className="flex justify-between items-center h-12 px-4">
        {left ? (
          left
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <IoIosArrowBack />
          </Button>
        )}
        <div className="font-semibold" suppressHydrationWarning>
          {title}
        </div>
        {right ? (
          right
        ) : (
          <div className="flex gap-2">
            <Link href="/account">
              <Button variant="outline" size="sm">
                <HiOutlineBanknotes /> 계좌
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <CiLogin /> 로그인
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
