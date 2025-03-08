"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const getLinkClass = (path: string) =>
    pathname.includes(path)
      ? "underline underline-offset-8 decoration-4 font-bold cursor-pointer"
      : "cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-4 hover:font-bold";

  return (
    <div className="flex flex-col divide-y divide-neutral-200">
      <header className="flex flex-col bg-neutral-50">
        <div className="container mx-auto flex justify-between items-center p-4 gap-4">
          <h1 className="font-bold text-2xl shrink-0">감자증권</h1>
          <Input type="type grow-1" placeholder="검색" />
          <Button className="shrink-0 cursor-pointer">검색</Button>
          <Button className="shrink-0 cursor-pointer" variant="secondary">
            로그인
          </Button>
        </div>
        <nav className="container mx-auto px-4 py-1.5">
          <ul className="flex gap-4">
            <li className={getLinkClass("/realtime")}>
              <Link href="/page/realtime">실시간 데이터</Link>
            </li>
            <li className={getLinkClass("/buy")}>
              <Link href="/page/buy">구매내역</Link>
            </li>
            <li className={getLinkClass("/sell")}>
              <Link href="/page/sell">판매내역</Link>
            </li>
            <li className={getLinkClass("/log")}>
              <Link href="/page/log">자동매매</Link>
            </li>
            <li className={getLinkClass("/money")}>
              <Link href="/page/money">자산</Link>
            </li>
            <li className={getLinkClass("/setting")}>
              <Link href="/page/setting">설정</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="">
        <div className="container mx-auto p-4">{children}</div>
      </main>
    </div>
  );
}
