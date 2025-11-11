'use client';

import { usePathname } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HiOutlineBanknotes } from 'react-icons/hi2';
import { CiLogin } from 'react-icons/ci';
import { headerStore } from '@/store/headerStore';
import { StrictMode } from 'react';
import { StudioDataProvider } from '@/hooks/useStudioData';

const PAGE_TITLES = {
  '/': 'Potato Invest',
  '/account': '계좌',
  '/held': '보유종목',
  '/recommend': '추천종목',
  '/settings': '설정',
  '/login': '로그인',
};

const DEFAULT_TITLE = 'Potato Invest';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col">
      <Header />
      {/* 헤더가 fixed라서 컨텐츠에 상단 여백을 부여 */}
      <div className="pt-12">{children}</div>
    </div>
  );
}

const Header = () => {
  const pathname = usePathname();
  // 초기 SSR/첫 클라이언트 렌더에서 동일한 문자열로 맞춰 수화 불일치 방지
  const [title, setTitle] = useState(DEFAULT_TITLE);
  // 스크롤 방향에 따라 헤더 자동 숨김/표시
  const [show, setShow] = useState(true); // 디폴트로 내려온 상태(표시)

  const { left, right } = headerStore();
  const lastYRef = useRef(0);

  useEffect(() => {
    if (!pathname) return;
    const next = PAGE_TITLES[pathname] || DEFAULT_TITLE;
    setTitle(next);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const last = lastYRef.current;
      const delta = Math.abs(y - last);
      if (delta < 6) return; // 작은 움직임 무시

      if (y < 10) {
        setShow(true); // 맨 위에서는 항상 표시
      } else {
        setShow(y < last); // 위로 스크롤하면 표시, 아래로 스크롤하면 숨김
      }
      lastYRef.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out`}
      style={{ transform: show ? 'translateY(0)' : 'translateY(-100%)' }}
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
        {/* suppressHydrationWarning: 서버/클라이언트 초기 텍스트 차이를 안전하게 무시 */}
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
};

// 메뉴 (/)
//   계좌
//   보유종목 (클릭시 카카오 or 계좌목록 이동)
//   추천종목
// 보유종목리스트 (/held)
// 추천종목리스트 (/recommend)
// 상세 (/detail)
// 매도 (/sell)
// 매수 (/buy)

// 카카오 로그인 (/login) (뒤로가기시 보유종목리스트으로 가야함)
// 계좌목록 선택 (/account) (뒤로가기시 보유종목리스트으로 가야함)
// 계좌 등록 (/account/add) (계좌목록으로 가야함)

// npx shadcn@latest add button
