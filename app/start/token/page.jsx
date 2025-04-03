'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { keyStore } from '@/store/keyStore';
import { tempKeyStore } from '@/store/tempKeyStore';
import useToken from '@/hooks/useToken';
import dayjs from 'dayjs';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // 화살표 아이콘 추가
import { Button } from '@/components/ui/button';

export default function Token() {
  /**
   * 페이지 간 이동을 처리하기 위한 Next.js 라우터 객체
   * @type {import('next/navigation').AppRouterInstance}
   */
  const router = useRouter();

  /**
   * 토큰 발급 상태를 저장하는 변수
   * @type {[string, Function]} 토큰 발급 상태와 업데이트 함수
   * 'idle': 초기 상태, 'loading': 토큰 발급 중, 'success': 토큰 발급 성공, 'error': 토큰 발급 실패
   */
  const [status, setStatus] = useState('idle');

  /**
   * 에러 메시지를 저장하는 변수
   * @type {[string, Function]} 에러 메시지와 업데이트 함수
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 저장된 키 정보를 담는 객체
   * @type {Object} 저장된 키 정보
   */
  const { key } = keyStore();

  /**
   * 발급된 토큰 정보를 담는 객체
   * @type {Object} 발급된 토큰 정보
   */
  const { key: tempKey, realKey } = tempKeyStore();

  /**
   * 토큰 발급 및 확인 관련 함수
   * @type {Object} 토큰 관련 함수들
   */
  const { 토큰발급, 발급된토큰확인 } = useToken();

  /**
   * 컴포넌트 마운트 시 필수 정보가 있는지 확인합니다.
   *
   * 동작:
   * 계좌번호, App Key, Secret Key가 모두 설정되어 있는지 확인합니다.
   */
  useEffect(() => {
    // 필수 정보가 설정되어 있는지 확인
    if (!key.account || !key.appKey || !key.secretKey) {
      setStatus('error');
      setErrorMessage(
        '계좌번호, App Key, Secret Key가 모두 설정되어 있어야 합니다.'
      );
    }
  }, [key.account, key.appKey, key.secretKey]);

  /**
   * 토큰을 발급하는 함수
   *
   * 동작:
   * 1. 토큰 발급 상태를 loading으로 설정합니다.
   * 2. 이미 발급된 토큰이 있는지 확인합니다.
   * 3. 없으면 토큰 발급을 시도합니다.
   * 4. 발급 결과에 따라 상태를 업데이트합니다.
   */
  const issueToken = async () => {
    try {
      // 필수 정보가 설정되어 있는지 확인
      if (!key.account || !key.appKey || !key.secretKey) {
        setStatus('error');
        setErrorMessage(
          '계좌번호, App Key, Secret Key가 모두 설정되어 있어야 합니다.'
        );
        return;
      }

      setStatus('loading');

      // 이미 발급된 토큰이 있는지 확인
      const hasToken = await 발급된토큰확인();

      if (hasToken) {
        // 토큰이 있는 경우 유효기간 확인
        const tokenInfo = key.isVts ? tempKey : realKey;
        const expiryDate = tokenInfo?.access_token_token_expired;

        if (expiryDate) {
          const expiry = dayjs(expiryDate);
          const now = dayjs();

          // 토큰이 유효한 경우 (만료 시간이 현재보다 나중)
          if (expiry.isAfter(now)) {
            setStatus('success');
            return;
          }
          // 토큰이 만료된 경우
          console.log('토큰이 만료되어 재발급을 시도합니다.');
        }
      }

      // 토큰이 없거나 만료된 경우 새로 발급 시도
      const result = await 토큰발급();

      if (result) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(
          '토큰 발급에 실패했습니다. 입력한 정보를 확인해주세요.'
        );
      }
    } catch (error) {
      console.error('토큰 발급 중 오류:', error);
      setStatus('error');
      setErrorMessage(error.message || '토큰 발급 중 오류가 발생했습니다.');
    }
  };

  /**
   * 다음 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 1. 토큰 발급이 성공한 경우 설정 화면(/page/setting)으로 이동합니다.
   * 2. 토큰 발급이 실패한 경우 키 입력 화면(/start/keys)으로 이동합니다.
   */
  const handleSubmit = () => {
    if (status === 'success') {
      router.push('/start/setting');
    } else {
      router.push('/start/keys');
    }
  };

  /**
   * 토큰 정보를 표시하는 컴포넌트
   * @returns {JSX.Element} 토큰 정보 UI
   */
  const renderTokenInfo = () => {
    if (status !== 'success') return null;

    const tokenInfo = key.isVts ? tempKey : realKey;

    return (
      <div className="bg-neutral-50 p-6 rounded-lg w-full">
        <h3 className="font-semibold text-lg mb-4">발급된 토큰 정보</h3>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-600">계좌 타입:</span>
            <span className="font-medium">
              {key.isVts ? '모의투자계좌' : '실전계좌'}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-600">토큰 유형:</span>
            <span className="font-medium">{tokenInfo?.token_type || '-'}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-neutral-600">유효 기간:</span>
            <span className="font-medium">
              {tokenInfo?.access_token_token_expired
                ? dayjs(tokenInfo.access_token_token_expired).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )
                : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    // 최상위 컨테이너를 flex-col로 변경하고 중앙 정렬을 위한 클래스 추가
    <div className="flex flex-col items-center justify-center min-h-svh p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 메인 콘텐츠 영역 - 중앙 정렬 */}
      <main className="flex flex-col gap-4 items-center w-full max-w-md">
        {/* 이미지 부분 */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/images/token.webp"
            alt="토큰 발급 아이콘"
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/key.jpg'; // 대체 이미지
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-black">토큰 발급</h1>

        <div>
          <p className="text-neutral-600">
            입력한 정보로 한국투자증권 API 토큰을 발급합니다.
          </p>
        </div>

        <div className="flex gap-6 items-center flex-col w-full max-w-md">
          {/* 토큰 발급 상태에 따른 UI */}
          <div className="flex flex-col items-center gap-4 w-full">
            {status === 'idle' && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-center text-neutral-700">
                  아래 버튼을 클릭하여 토큰을 발급해주세요.
                </p>
                <Button
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center text-white cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 mt-2"
                  onClick={issueToken}
                >
                  토큰 발급하기
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-center">토큰을 발급 중입니다...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-red-500 text-5xl">!</div>
                <p className="text-center text-red-500 font-medium">
                  토큰 발급에 실패했습니다.
                </p>
                <p className="text-center text-neutral-600">{errorMessage}</p>
                <p className="text-center text-neutral-600 text-sm">
                  입력한 계좌번호와 API 키 정보를 확인하고 다시 시도해주세요.
                </p>
                <button
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 mt-2"
                  onClick={issueToken}
                >
                  다시 시도하기
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-green-500 text-5xl">✓</div>
                <p className="text-center text-green-500 font-medium">
                  토큰 발급에 성공했습니다!
                </p>
                <p className="text-center text-neutral-600">
                  API 키와 계좌번호가 정상적으로 검증되었습니다.
                </p>
                {renderTokenInfo()}
              </div>
            )}
          </div>

          {/* 다음 단계 버튼 부분 수정 - 성공 또는 실패 상태일 때만 표시 */}
          {(status === 'success' || status === 'error') && (
            <div className="flex w-full justify-between mt-8">
              {/* 뒤로가기 버튼 */}
              <button
                className="rounded-full border border-neutral-300 transition-colors flex items-center justify-center bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                onClick={() => router.push('/start/keys')}
              >
                <FaArrowLeft className="mr-2" /> 뒤로
              </button>

              {/* 다음 버튼 */}
              <button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                onClick={handleSubmit}
              >
                {status === 'success' ? (
                  <>
                    다음 <FaArrowRight className="ml-2" />
                  </>
                ) : (
                  <>
                    다시 시도 <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
