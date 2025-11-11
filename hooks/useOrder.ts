"use client";
import { useMutation } from "@tanstack/react-query";
import useApi from "./useApi";
import { toast } from "sonner";

interface OrderPayload {
  // 한국투자증권 해외주식 주문 형식에 맞춰 확장
  CANO?: string;
  ACNT_PRDT_CD?: string;
  OVRS_EXCG_CD?: string; // NASD / NYSE / AMEX 등
  PDNO: string; // 종목코드
  ORD_DVSN: string; // 주문구분
  ORD_QTY: string; // 수량
  ORD_UNPR: string; // 주문단가
  CRNC_CD?: string; // 통화코드 (USD 등)
  // ... 추가 필드
}

export function useOrder() {
  const api = useApi();

  const mutation = useMutation<unknown, Error, OrderPayload>({
    mutationFn: async (payload) => {
      const res = await api.trading.order(payload);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg1 || json?.error || "주문 실패");
      return json;
    },
    onSuccess: () => toast.success("주문 접수 완료"),
    onError: (e) => toast.error(e.message),
  });

  return {
    place: mutation.mutateAsync,
    placing: mutation.isPending,
  };
}

export default useOrder;
