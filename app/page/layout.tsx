'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import useToken from '@/hooks/useToken';
import Nav from './Nav';
import Header from './Header';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { 발급된토큰확인, isReady } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // 토큰 체크 횟수를 추적
  //const [checkCount, setCheckCount] = useState(0);

  // 토큰 체크 함수
  const checkToken = useCallback(async () => {
    try {
      const hasValidToken = await 발급된토큰확인();
      console.log('발급된 토큰 확인:', hasValidToken);

      // 토큰 상태 업데이트
      setIsTokenValid(hasValidToken);

      // 체크 횟수 증가
      //setCheckCount((prev) => prev + 1);

      // 첫 번째 체크에서 토큰이 없으면 리다이렉트하지 않고 추가 체크 진행
      if (!hasValidToken) {
        router.push('/');
      }
    } catch (error) {
      console.error('토큰 확인 중 오류 발생:', error);

      // 첫 번째 체크 후에만 리다이렉트

      router.push('/');
    } finally {
      console.log('토큰 체크 완료');
      // 첫 번째 체크 후에 로딩 상태 해제
      setIsLoading(false);
    }
  }, [발급된토큰확인, router]);

  // 컴포넌트 마운트 시 토큰 첫 체크
  useEffect(() => {
    // Store 초기화를 위한 시간을 주기 위해 약간 지연
    if (isReady) checkToken();
  }, [isReady]);

  // 첫 번째 체크 후 토큰이 유효하지 않으면 추가 체크 수행
  // useEffect(() => {
  //   if (checkCount === 1 && !isTokenValid) {
  //     // 첫 번째 체크에서 토큰이 유효하지 않으면 1초 후 다시 체크
  //     const timeout = setTimeout(() => {
  //       checkToken();
  //     }, 1000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [checkCount, isTokenValid]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col divide-y divide-neutral-200 bg-neutral-100 min-h-screen">
        <Header>
          <Nav />
        </Header>
        <main className="pt-20">
          <div className="container mx-auto p-4">
            {isLoading ? (
              // 로딩 중일 때 표시할 내용
              <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : isTokenValid ? (
              // 토큰이 유효할 때만 children 표시
              children
            ) : null}
            <Toaster />
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
