"use client";
import { useMutation } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";
import { toast } from "sonner";

interface OrderParams {
  exchange: string;
  stock: string;
  qty: number;
  unpr: number;
  orderType: "buy" | "sell";
}

interface OrderResponse {
  rt_cd?: string; // 응답코드 ("0": 성공)
  msg_cd?: string; // 메시지코드
  msg1?: string; // 메시지
  output?: {
    KRX_FWDG_ORD_ORGNO?: string; // 한국거래소전송주문조직번호
    ODNO?: string; // 주문번호
    ORD_TMD?: string; // 주문시각
  };
}

/**
 * useOrder
 * - 해외주식 주문 (매수/매도)
 * - accountTokenStore에서 계좌 ID와 토큰 가져오기
 * - exchange, stock, qty, unpr, orderType 전달
 */
export function useOrder() {
  const { activeAccountId, tokens } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const mutation = useMutation<OrderResponse, Error, OrderParams>({
    mutationFn: async ({ exchange, stock, qty, unpr, orderType }) => {
      if (!activeAccountId) {
        throw new Error("계좌가 선택되지 않았습니다");
      }

      if (!session) {
        throw new Error("로그인이 필요합니다");
      }

      const accountId = activeAccountId;
      const token = tokens[accountId];

      if (!token?.access_token) {
        throw new Error("계좌 인증이 필요합니다");
      }

      const res = await fetch("/api/overseas/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          exchange,
          stock,
          qty,
          unpr,
          orderType,
        }),
      });

      const data = (await res.json()) as OrderResponse;

      if (!res.ok || data.rt_cd !== "0") {
        throw new Error(data.msg1 || "주문 실패");
      }

      return data;
    },
    onSuccess: (data, variables) => {
      const orderTypeText = variables.orderType === "buy" ? "매수" : "매도";
      toast.success(`${orderTypeText} 주문 성공`, {
        description: `${variables.stock} ${variables.qty}주 ${orderTypeText} 주문이 접수되었습니다.`,
      });
    },
    onError: (error) => {
      toast.error("주문 실패", {
        description: error.message,
      });
    },
  });

  return {
    order: mutation.mutateAsync,
    orderSync: mutation.mutate,
    isOrdering: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export default useOrder;
