import { Loader2 } from 'lucide-react';
import React from 'react';

/**
 * OpacityLoader 컴포넌트
 *
 * 자식 요소를 감싸고 로딩 상태일 때 반투명하게 표시하며 로딩 스피너를 오버레이합니다.
 *
 * @param {Object} props 컴포넌트 속성
 * @param {boolean} props.isLoading 로딩 상태
 * @param {React.ReactNode} props.children 자식 요소
 * @param {string} [props.className] 추가 클래스명
 * @param {string} [props.message] 로딩 메시지
 * @param {number} [props.opacity=0.6] 로딩 중 불투명도 (0-1 사이)
 * @returns {React.ReactElement}
 */
const OpacityLoader = ({
  isLoading,
  children,
  className = '',
  message = '로딩 중...',
  opacity = 0.6,
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* 자식 컴포넌트 */}
      <div
        className={`transition-opacity duration-200 ${
          isLoading ? `opacity-${Math.round(opacity * 10)}` : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-40 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
          {message && (
            <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OpacityLoader;
