import useApi from '@/hooks/useApi';
import useAccount from '@/hooks/useAccount';

import { useProfitStore } from '@/store/useProfitStore';
import dayjs from 'dayjs';

const useProfit = () => {
  const { profitData, setProfitData } = useProfitStore();

  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  // 조회 시작일자
  const INQR_STRT_DT = '20250301';

  // trad_day : 거래일자임

  // 가장 마지막으로 조회된 거래일자
  const lastDay =
    profitData.length > 0
      ? profitData.reduce(
          (max, item) => (item.trad_day > max ? item.trad_day : max),
          INQR_STRT_DT
        )
      : INQR_STRT_DT;

  const fetchProfitData = async () => {
    let allData = [];
    let hasMore = true;
    let ctxAreaNk200 = '';
    let ctxAreaFk200 = '';
    // 기존 내역이 있다면 마지막 거래일 다음날부터 조회
    let startDate = lastDay;
    const endDate = dayjs().format('YYYYMMDD');

    // 중복 제거를 위한 Set (trad_day + ovrs_pdno 조합으로 유니크)
    const uniqueSet = new Set(
      profitData.map((item) => `${item.trad_day}_${item.ovrs_pdno}`)
    );

    while (hasMore) {
      const payload = {
        CANO,
        ACNT_PRDT_CD,
        OVRS_EXCG_CD: 'NASD',
        NATN_CD: '', // 국가코드 : 공란
        CRCY_CD: '', // 통화코드 : 공란
        PDNO: '', // 상품번호 : 공란
        INQR_STRT_DT: startDate,
        INQR_END_DT: endDate,
        WCRC_FRCR_DVSN_CD: '02', // 원화외화구분코드 : 01: 외화, 02: 원화
        CTX_AREA_FK200: ctxAreaFk200,
        CTX_AREA_NK200: ctxAreaNk200,
      };

      let response;
      let data;
      let retryCount = 0;
      // fetch 실패 시 최대 3회 재시도
      while (retryCount < 3) {
        response = await api.trading.inquirePeriodProfit(payload);
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        if (data && data.message === 'fetch failed') {
          retryCount++;
          await new Promise((res) => setTimeout(res, 1000 * retryCount)); // 점점 대기시간 증가
          continue;
        }
        break;
      }

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      if (data?.output1?.length > 0) {
        // 중복 제거 후 데이터 추가
        const newItems = data.output1.filter(
          (item) => !uniqueSet.has(`${item.trad_day}_${item.ovrs_pdno}`)
        );
        newItems.forEach((item) =>
          uniqueSet.add(`${item.trad_day}_${item.ovrs_pdno}`)
        );
        allData = [...allData, ...newItems];

        // 연속 조회 키가 있으면 다음 페이지로
        if (data.ctx_area_nk200 && data.ctx_area_nk200.trim() !== '') {
          ctxAreaNk200 = data.ctx_area_nk200;
          ctxAreaFk200 = data.ctx_area_fk200;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    // 기존 데이터와 합치고 중복 제거
    const merged = [...profitData, ...allData].filter(
      (item, idx, arr) =>
        arr.findIndex(
          (v) => v.trad_day === item.trad_day && v.ovrs_pdno === item.ovrs_pdno
        ) === idx
    );

    setProfitData(merged);
    return merged;
  };

  return {
    profitData,
    fetchProfitData,
  };
};

export default useProfit;
