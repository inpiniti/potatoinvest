'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import { AiFillIdcard } from 'react-icons/ai';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineRecommend } from 'react-icons/md';
import { headerStore } from '@/store/headerStore';
import { useEffect } from 'react';

const Studio4 = () => {
  const { setLeft } = headerStore();

  useEffect(() => {
    setLeft(
      <Link href="/studio4/other/created">
        <Button variant="outline" size="sm">
          <AiFillIdcard /> 만든사람
        </Button>
      </Link>
    );
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center p-4">
      <Card className="w-full flex flex-col gap-4">
        <CardHeader>
          <CardTitle>보유 종목</CardTitle>
          <CardDescription>
            보유종목은 내 계좌에 실제로 보유하고 있는 주식 종목들을 나타냅니다.
            현재는 한국투자증권의 계좌만을 등록할 수 있습니다. 해당 메뉴는
            로그인을 하셔야 진행이 가능합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm" disabled>
            <Link href="/studio4/held">
              <IoPersonCircleOutline /> 보유종목
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="w-full flex flex-col gap-4">
        <CardHeader>
          <CardTitle>투자자 종목</CardTitle>
          <CardDescription>
            투자자 종목은 월가의 유명 투자자 및 유명 투자기관들이 보유한 종목을
            보여줍니다. 투자자들이 많이 가지고 있는 종목 순서대로 보여줍니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/studio4/recommend">
              <MdOutlineRecommend /> 투자자 종목
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Studio4;
