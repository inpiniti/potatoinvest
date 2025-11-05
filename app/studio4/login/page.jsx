'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import useKakao from '@/hooks/useKakao';

const login = () => {
  const { data, login, logout } = useKakao();

  return (
    <div className="flex flex-col items-center pt-4">
      {data.isLoggedIn ? (
        <Card className="w-96 flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Potato Invest 로그인</CardTitle>
            <CardDescription>
              정상적으로 로그인이 완료 되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full" onClick={logout}>
              로그아웃
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-96 flex flex-col gap-4">
          <CardHeader>
            <CardTitle>Potato Invest 로그인</CardTitle>
            <CardDescription>
              감자증권은 카카오 로그인을 지원합니다. 인증을 해야 등록된 계좌 및
              거래내역을 확인할 수 있으며, 매도 및 매수 등이 가능해집니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" className="w-full" onClick={login}>
              Login with 카카오
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default login;
