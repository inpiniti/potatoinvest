"use client";
import { useEffect, useState } from "react";

/**
 * 뷰포트 width 가 주어진 min/max 범위 안에 있는지 여부 반환
 * @param {{min?: number, max?: number}} param0
 *  - min: inclusive (지정 시 그 이상)
 *  - max: inclusive (지정 시 그 이하)
 */
export function useViewportRange({ min, max }) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    function check() {
      const w = window.innerWidth;
      if (min != null && max != null) {
        setMatch(w >= min && w <= max);
      } else if (min != null) {
        setMatch(w >= min);
      } else if (max != null) {
        setMatch(w <= max);
      } else {
        setMatch(true);
      }
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [min, max]);

  return match;
}
