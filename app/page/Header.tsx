import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ReactNode, useEffect, useState } from 'react';

const Header = ({ children }: { children: ReactNode }) => {
  const [showHeader, setShowHeader] = useState(true);
  let lastScrollY = 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // 스크롤 다운 시 헤더 숨김, 스크롤 업 시 헤더 보임
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        transition: 'transform 0.3s ease-in-out',
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
      }}
      className="flex flex-col bg-white fixed top-0 left-0 right-0 z-10"
    >
      <div className="container mx-auto flex justify-between items-center p-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 sm:p-2 md:p-3 lg:p-4 md:text-lg lg:text-xl">
        <h1 className="font-bold shrink-0">감자증권</h1>
        <Input className="!h-8" type="type grow-1" placeholder="검색" />
        <Button size="sm" className="shrink-0 cursor-pointer">
          검색
        </Button>
        <Button
          size="sm"
          className="shrink-0 cursor-pointer"
          variant="secondary"
        >
          로그인
        </Button>
      </div>
      {children}
    </header>
  );
};

export default Header;
