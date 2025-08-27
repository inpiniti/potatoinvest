"use client";
import { useQuery } from '@tanstack/react-query';
import { accountTokenStore } from '@/store/accountTokenStore';
import { supabase } from '@/lib/supabaseClient';

interface PresentBalanceParams {
  accountId: number;
  kiAccessToken: string; // Korea Investment access token (already issued)
  isVts?: boolean;
  CANO?: string;
  ACNT_PRDT_CD?: string;
  WCRC_FRCR_DVSN_CD?: string;
  NATN_CD?: string;
  TR_MKET_CD?: string;
  INQR_DVSN_CD?: string;
}

interface Output2Item {
  crcy_cd: string;
  crcy_cd_name?: string;
  frcr_buy_amt_smtl?: string;
  frcr_sll_amt_smtl?: string;
  frcr_dncl_amt_2?: string;
  frst_bltn_exrt?: string;
  frcr_buy_mgn_amt?: string;
  frcr_etc_mgna?: string;
  frcr_drwg_psbl_amt_1?: string;
  frcr_evlu_amt2?: string;
  acpl_cstd_crcy_yn?: string;
  nxdy_frcr_drwg_psbl_amt?: string;
  [k: string]: unknown;
}

interface Output3Item {
  pchs_amt_smtl?: string;
  evlu_amt_smtl?: string;
  evlu_pfls_amt_smtl?: string;
  dncl_amt?: string;
  cma_evlu_amt?: string;
  tot_dncl_amt?: string;
  etc_mgna?: string;
  wdrw_psbl_tot_amt?: string;
  frcr_evlu_tota?: string;
  evlu_erng_rt1?: string;
  pchs_amt_smtl_amt?: string;
  evlu_amt_smtl_amt?: string;
  tot_evlu_pfls_amt?: string;
  tot_asst_amt?: string;
  buy_mgn_amt?: string;
  mgna_tota?: string;
  frcr_use_psbl_amt?: string;
  ustl_sll_amt_smtl?: string;
  ustl_buy_amt_smtl?: string;
  tot_frcr_cblc_smtl?: string;
  tot_loan_amt?: string;
  [k: string]: unknown;
}

interface Output1Item {
  prdt_name: string; // 상품명
  cblc_qty13?: string; // 잔고수량
  thdt_buy_ccld_qty1?: string;
  thdt_sll_ccld_qty1?: string;
  ccld_qty_smtl1?: string; // 체결수량합계 (현재 보유)
  ord_psbl_qty1?: string; // 주문가능
  frcr_pchs_amt?: string; // 외화매입금액
  frcr_evlu_amt2?: string; // 외화평가금액
  evlu_pfls_amt2?: string; // 평가손익금액
  evlu_pfls_rt1?: string; // 평가손익율
  pdno?: string; // 종목코드
  bass_exrt?: string; // 기준환율
  buy_crcy_cd?: string; // 매수통화코드
  ovrs_now_pric1?: string; // 해외현재가격
  avg_unpr3?: string; // 평균단가
  tr_mket_name?: string;
  natn_kor_name?: string;
  pchs_rmnd_wcrc_amt?: string; // 매입잔액원화금액
  thdt_buy_ccld_frcr_amt?: string;
  thdt_sll_ccld_frcr_amt?: string;
  unit_amt?: string;
  std_pdno?: string;
  prdt_type_cd?: string;
  scts_dvsn_name?: string;
  loan_rmnd?: string;
  loan_dt?: string;
  loan_expd_dt?: string;
  ovrs_excg_cd?: string;
  item_lnkg_excg_cd?: string;
  prdt_dvsn?: string;
  [k: string]: unknown;
}

interface PresentBalanceResponseRaw {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output1?: Output1Item[]; // positions
  output2?: Output2Item[]; // currency summary
  output3?: Output3Item | Output3Item[]; // total summary may come as object or single-item array
}

export function usePresentBalance(params: PresentBalanceParams | null) {
  const { activeAccountId } = accountTokenStore();
  // KI access token kept in params. We will fetch Supabase session token just-in-time.
  return useQuery<PresentBalanceResponseRaw>({
    queryKey: ['presentBalance', activeAccountId, params?.kiAccessToken, params],
    enabled: Boolean(activeAccountId && params && params.accountId === activeAccountId && params.kiAccessToken),
    queryFn: async () => {
      if (!params) throw new Error('Params missing');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch('/api/accounts/presentBalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(params),
      });
  const json: PresentBalanceResponseRaw = await res.json();
      if (!res.ok || json.rt_cd !== '0') {
        throw new Error(json.msg1 || '잔고 조회 실패');
      }
      return json;
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
    meta: { description: 'present balance for active account' },
  });
}

export function invalidatePresentBalanceCache() {
  // Placeholder; use QueryClient.invalidateQueries in UI layer.
}

export type { PresentBalanceParams, PresentBalanceResponseRaw, Output1Item, Output2Item, Output3Item };