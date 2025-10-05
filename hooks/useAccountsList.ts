"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { accountSelectionStore } from "@/store/accountSelectionStore";
import useKakao from "./useKakao";
import { toast } from "sonner";

interface AccountRecord {
  id: number;
  account_number: string;
  alias?: string | null;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
  created_at?: string;
}

interface AccountsResponse {
  accounts?: AccountRecord[];
}

export function useAccountsList() {
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const query = useQuery<AccountsResponse>({
    queryKey: ["accounts-list", session?.user?.id ?? "anon"],
    enabled: !!session,
    queryFn: async () => {
      if (!session) return { accounts: [] };
      const res = await fetch("/api/accounts", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "계좌 목록 조회 실패");
      }
      const json = (await res.json()) as AccountsResponse;
      return json;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Add account
  const addMutation = useMutation({
    mutationFn: async (payload: {
      accountNumber: string;
      alias?: string;
      apiKey: string;
      apiSecret: string;
    }) => {
      if (!session) throw new Error("로그인 필요");
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "계좌 추가 실패");
      }
    },
    onSuccess: async () => {
      toast.success("계좌가 추가되었습니다.");
      await query.refetch();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "계좌 추가 실패";
      toast.error(msg);
    },
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!session) throw new Error("로그인 필요");
      const res = await fetch("/api/accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "계좌 삭제 실패");
      }
    },
    onSuccess: async () => {
      toast.success("계좌가 삭제되었습니다.");
      await query.refetch();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "계좌 삭제 실패";
      toast.error(msg);
    },
  });

  // Update settings (max_positions, target_cash_ratio)
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      accountId: number;
      max_positions: number;
      target_cash_ratio: number;
    }) => {
      if (!session) throw new Error("로그인 필요");
      const res = await fetch("/api/accounts/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "계좌 설정 저장 실패");
      }
    },
    onSuccess: async () => {
      toast.success("계좌 설정이 저장되었습니다.");
      await query.refetch();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "계좌 설정 저장 실패";
      toast.error(msg);
    },
  });

  const accounts: AccountRecord[] = useMemo(
    () => query.data?.accounts ?? [],
    [query.data]
  );

  // 전역 선택 상태(Zustand)
  const selectedAccountId = accountSelectionStore((s) => s.selectedAccountId);
  const setSelected = accountSelectionStore((s) => s.setSelectedAccount);

  // 계좌 목록이 변경되어 현재 선택된 id가 사라진 경우 선택 해제
  useEffect(() => {
    if (
      selectedAccountId != null &&
      !accounts.find((a) => a.id === selectedAccountId)
    ) {
      setSelected(null);
    }
  }, [accounts, selectedAccountId, setSelected]);

  const selectAccount = (id: number | null) => setSelected(id);
  const selectedAccount =
    selectedAccountId != null
      ? accounts.find((a) => a.id === selectedAccountId) || null
      : null;

  return {
    data: accounts,
    refresh: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    // mutations
    addAccount: addMutation.mutateAsync,
    adding: addMutation.isPending,
    deleteAccount: deleteMutation.mutateAsync,
    deleting: deleteMutation.isPending,
    updateAccountSettings: updateSettingsMutation.mutateAsync,
    updating: updateSettingsMutation.isPending,
    // selection
    selectedAccountId,
    selectedAccount,
    selectAccount,
  };
}

export default useAccountsList;
