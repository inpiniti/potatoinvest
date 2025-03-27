import { Button } from '@/components/ui/button';

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
      className="flex flex-col bg-white fixed top-0 left-0 right-0 z-10 gap-1"
    >
      <div className="container mx-auto flex justify-between items-center pt-2 px-4">
        <h1 className="font-bold shrink-0 text-xl">감자증권</h1>
      </div>
      {children}
    </header>
  );
};

export default Header;
