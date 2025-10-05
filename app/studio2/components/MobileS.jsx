"use client";
import React from "react";

// 0 - 319px 까지 혹은 정확히 320px 기준으로 사용할 경우 320px 미만 장치 구분이 필요하면 minWidth 조정
// 요구사항: 320px 뷰포트에 대응. 여기서는 width >= 0 && < 375 영역 중 가장 작은 세그먼트를 대표.
// 단순화를 위해 0 ~ 374 구간을 MobileS 로 가정.

import { useViewportRange } from "./useViewportRange";

export default function MobileS({ children }) {
  const match = useViewportRange({ max: 374 });
  if (!match) return null;
  return <>{children}</>;
}
