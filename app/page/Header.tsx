import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ReactNode } from 'react';

const Header = ({ children }: { children: ReactNode }) => {
  return (
    <header className="flex flex-col bg-white">
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
