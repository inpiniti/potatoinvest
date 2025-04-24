import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// 기본 로그 컴포넌트 인터페이스
export interface LogComponentProps {
  date: string;
  id: string;
}

// 컴포넌트 A: 사용자 확인이 필요한 텍스트 로그
export const TextLogComponent: React.FC<
  LogComponentProps & {
    text: string;
    loading?: boolean;
    onConfirm: (id: string) => void;
  }
> = ({ date, text, id, loading = false, onConfirm }) => (
  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
    <p className="text-xs text-neutral-400">{date}</p>
    <div className="flex flex-col gap-2">
      <p className="font-medium text-blue-800">{text}</p>
      <Button
        variant="outline"
        size="sm"
        className="self-end text-blue-600 border-blue-300 hover:bg-blue-100"
        onClick={() => onConfirm(id)}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            처리 중...
          </>
        ) : (
          "확인 및 계속"
        )}
      </Button>
    </div>
  </div>
);

// 확인된 텍스트 로그
export const ConfirmedTextLogComponent: React.FC<
  LogComponentProps & {
    text: string;
  }
> = ({ date, text }) => (
  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 opacity-75">
    <p className="text-xs text-neutral-400">{date}</p>
    <div className="flex items-center gap-2">
      <p className="font-medium text-blue-800">{text}</p>
      <span className="text-xs bg-blue-200 px-2 py-0.5 rounded text-blue-700">
        확인됨
      </span>
    </div>
  </div>
);

// 컴포넌트 B: 경고 로그 (API 자동 호출)
export const WarningLogComponent: React.FC<
  LogComponentProps & {
    message: string;
    loading?: boolean;
  }
> = ({ date, message, loading = false }) => (
  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
    <p className="text-xs text-neutral-400">{date}</p>
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="text-yellow-500"
        viewBox="0 0 16 16"
      >
        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
      </svg>
      <p className="font-medium text-yellow-800">{message}</p>
      {loading && (
        <Loader2 className="w-4 h-4 ml-2 animate-spin text-yellow-600" />
      )}
    </div>
  </div>
);

// 컴포넌트 C: 성공 로그 (API 자동 호출)
export const SuccessLogComponent: React.FC<
  LogComponentProps & {
    result: string;
    loading?: boolean;
  }
> = ({ date, result, loading = false }) => (
  <div className="bg-green-50 p-4 rounded-md border border-green-100">
    <p className="text-xs text-neutral-400">{date}</p>
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="text-green-500"
        viewBox="0 0 16 16"
      >
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
      </svg>
      <p className="font-medium text-green-800">{result}</p>
      {loading && (
        <Loader2 className="w-4 h-4 ml-2 animate-spin text-green-600" />
      )}
    </div>
  </div>
);
