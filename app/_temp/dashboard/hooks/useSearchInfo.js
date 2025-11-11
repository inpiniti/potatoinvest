import { useMutation } from '@tanstack/react-query';
import useApi from '@/hooks/useApi';

// const data = {
//   std_pdno: 'KYG478621009', // 표준상품번호
//   prdt_eng_name: 'CURRENC GROUP INC', // 상품영문명
//   natn_cd: '840', // 국가코드
//   natn_name: '미국', // 국가명
//   tr_mket_cd: '01', // 거래시장코드
//   tr_mket_name: '나스닥', // 거래시장명
//   ovrs_excg_cd: 'NASD', // 해외거래소코드
//   ovrs_excg_name: '나스닥', // 해외거래소명
//   tr_crcy_cd: 'USD', // 거래통화코드
//   ovrs_papr: '0.00000', // 해외액면가
//   crcy_name: '미국 달러', // 통화명
//   ovrs_stck_dvsn_cd: '01', // 해외주식구분코드 (01.주식, 02.WARRANT, 03.ETF, 04.우선주)
//   prdt_clsf_cd: '101210', // 상품분류코드
//   prdt_clsf_name: '해외주식', // 상품분류명
//   sll_unit_qty: '1', // 매도단위수량
//   buy_unit_qty: '1', // 매수단위수량
//   tr_unit_amt: '0', // 거래단위금액
//   lstg_stck_num: '46528000', // 상장주식수
//   lstg_dt: '20240903', // 상장일자
//   ovrs_stck_tr_stop_dvsn_cd: '01', // 해외주식거래정지구분코드
//   lstg_abol_item_yn: 'N', // 상장폐지종목여부
//   ovrs_stck_prdt_grp_no: '76333', // 해외주식상품그룹번호
//   lstg_yn: 'Y', // 상장여부
//   tax_levy_yn: 'N', // 세금징수여부
//   ovrs_stck_erlm_rosn_cd: '03', // 해외주식등록사유코드
//   ovrs_stck_hist_rght_dvsn_cd: '00', // 해외주식이력권리구분코드
//   chng_bf_pdno: '', // 변경전상품번호
//   prdt_type_cd_2: '', // 상품유형코드2
//   ovrs_item_name: '', // 해외종목명
//   sedol_no: '', // SEDOL번호
//   blbg_tckr_text: '', // 블룸버그티커내용
//   ovrs_stck_etf_risk_drtp_cd: '', // 해외주식ETF위험지표코드
//   etp_chas_erng_rt_dbnb: '0.000000', // ETP추적수익율배수
//   istt_usge_isin_cd: 'KYG478621009', // 기관용도ISIN코드
//   mint_svc_yn: '', // MINT서비스여부
//   mint_svc_yn_chng_dt: '', // MINT서비스여부변경일자
//   prdt_name: '커런시', // 상품명
//   lei_cd: '', // LEI코드
//   ovrs_stck_stop_rson_cd: '', // 해외주식정지사유코드
//   lstg_abol_dt: '', // 상장폐지일자
//   mini_stk_tr_stat_dvsn_cd: '', // 미니스탁거래상태구분코드
//   mint_frst_svc_erlm_dt: '', // MINT최초서비스등록일자
//   mint_dcpt_trad_psbl_yn: 'N', // MINT소수점매매가능여부
//   mint_fnum_trad_psbl_yn: 'N', // MINT정수매매가능여부
//   mint_cblc_cvsn_ipsb_yn: 'N', // MINT잔고전환불가여부
//   ptp_item_yn: 'N', // PTP종목여부
//   ptp_item_trfx_exmt_yn: 'N', // PTP종목양도세면제여부
//   ptp_item_trfx_exmt_strt_dt: '', // PTP종목양도세면제시작일자
//   ptp_item_trfx_exmt_end_dt: '', // PTP종목양도세면제종료일자
//   dtm_tr_psbl_yn: 'N', // 주간거래가능여부
//   sdrf_stop_ecls_yn: 'N', // 급등락정지제외여부
//   sdrf_stop_ecls_erlm_dt: '00000000', // 급등락정지제외등록일자
//   memo_text1: '', // 메모
//   ovrs_now_pric1: '0.49800', // 현재가
//   last_rcvg_dtime: '20250611104038', // 최종수신일시
// };

const useSearchInfo = () => {
  const api = useApi();

  // PDNO, PRDT_TYPE_CD를 파라미터로 받음
  const fetchSearchInfo = async ({ PRDT_TYPE_CD = '512', PDNO }) => {
    const payload = {
      PRDT_TYPE_CD,
      PDNO,
    };

    const response = await api.quotations.searchInfo(payload);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.output || {};
  };

  // useMutation 사용, 사용자가 직접 호출
  const mutation = useMutation({
    mutationFn: fetchSearchInfo,
    onError: (error) => {
      console.error('검색 정보 쿼리 오류:', error);
    },
  });

  return mutation;
};

export default useSearchInfo;
