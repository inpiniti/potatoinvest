import React from "react";
import {
  TextLogComponent,
  ConfirmedTextLogComponent,
  WarningLogComponent,
  SuccessLogComponent,
} from "../components/LogComponents";

// 로그 타입 정의
export type LogType = "text" | "warning" | "success";

// 로그 데이터 인터페이스
export interface LogData {
  id: string;
  type: LogType;
  date: string;
  content: string;
  confirmed?: boolean;
  loading?: boolean;
  processed?: boolean;
}

// 로그 컴포넌트 팩토리 함수
export const createLogComponent = (
  logData: LogData,
  key: React.Key,
  onConfirm: (id: string) => void
): React.ReactNode => {
  const { id, type, date, content, confirmed, loading } = logData;

  switch (type) {
    case "text":
      return confirmed ? (
        <ConfirmedTextLogComponent
          key={key}
          id={id}
          date={date}
          text={content}
        />
      ) : (
        <TextLogComponent
          key={key}
          id={id}
          date={date}
          text={content}
          loading={loading}
          onConfirm={onConfirm}
        />
      );
    case "warning":
      return (
        <WarningLogComponent
          key={key}
          id={id}
          date={date}
          message={content}
          loading={loading}
        />
      );
    case "success":
      return (
        <SuccessLogComponent
          key={key}
          id={id}
          date={date}
          result={content}
          loading={loading}
        />
      );
    default:
      return (
        <TextLogComponent
          key={key}
          id={id}
          date={date}
          text={content}
          loading={loading}
          onConfirm={onConfirm}
        />
      );
  }
};
