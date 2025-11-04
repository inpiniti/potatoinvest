'use client';

import { usePathname } from 'next/navigation';
import { IoIosArrowBack } from 'react-icons/io';
import { Button } from '@/components/ui/button';

const PAGE_TITLES = {
  '/studio4': 'Potato Invest',
  '/studio4/analysis': '종목 분석',
  '/studio4/portfolio': '포트폴리오',
  '/studio4/settings': '설정',
  // 필요한 경로 추가
};

export default function Layout({ children }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Studio 4';

  return (
    <div className="flex flex-col divide-y">
      <div className="flex justify-between p-4">
        <Button variant="outline">
          <IoIosArrowBack />
        </Button>
        <div className="font-semibold">{title}</div>
        <div>만든사람</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

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
