import useApi from '@/hooks/useApi';
import useAccount from '@/hooks/useAccount';
import { useQuery } from '@tanstack/react-query';
import { useProfitStore } from '@/store/useProfitStore';
import { keyStore } from '@/store/keyStore';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const useProfit = () => {
  const { key } = keyStore();
  const { appKey, secretKey } = key;

  const { profitData, setProfitData } = useProfitStore();
  // 일별인지 월별인지 개별인지
  const [profitType, setProfitType] = useState('individual'); // 'daily', 'monthly', 'individual'
  const [dailyProfitData, setDailyProfitData] = useState([]); // 일별
  const [monthlyProfitData, setMonthlyProfitData] = useState([]); // 월별
  const [error, setError] = useState(null);

  // 총 매매손익
  const [totalProfit, setTotalProfit] = useState(0);

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

  // 수익 데이터 가져오기 함수
  const fetchProfitData = async () => {
    try {
      // API 키가 없으면 작업 중단
      if (!appKey || !secretKey) {
        throw new Error(
          'API 키가 설정되지 않았습니다. 계정 설정을 확인해주세요.'
        );
      }

      // 계좌 정보가 없으면 작업 중단
      if (!CANO || !ACNT_PRDT_CD) {
        throw new Error('계좌 정보가 없습니다. 계정 설정을 확인해주세요.');
      }

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
      const merged = [...profitData, ...allData]
        .filter(
          (item, idx, arr) =>
            arr.findIndex(
              (v) =>
                v.trad_day === item.trad_day && v.ovrs_pdno === item.ovrs_pdno
            ) === idx
        )
        .sort(
          (a, b) =>
            b.trad_day.localeCompare(a.trad_day) ||
            a.ovrs_pdno.localeCompare(b.ovrs_pdno)
        );

      setProfitData(merged);
      return merged;
    } catch (error) {
      console.error('수익 데이터 로드 실패:', error);
      setError(error.message);
      throw error;
    }
  };

  // React Query 사용해서 데이터 관리
  const query = useQuery({
    queryKey: ['profitData'],
    queryFn: fetchProfitData,
    enabled: !!appKey && !!secretKey && !!CANO && !!ACNT_PRDT_CD, // API 키와 계좌 정보가 있을 때만 실행
    staleTime: Infinity, // 이 데이터는 수동으로만 갱신하기 위해 staleTime을 Infinity로 설정
    retry: 1, // 실패 시 한 번만 재시도
    onError: (error) => {
      console.error('수익 데이터 쿼리 오류:', error);
      setError(error.message);
    },
  });

  // profitData가 변할 때마다 일별/월별 데이터 가공
  useEffect(() => {
    // 일별 그룹화
    const groupedDailyData = profitData?.reduce((acc, item) => {
      const existingGroup = acc.find(
        (group) => group.trad_day === item.trad_day
      );
      if (existingGroup) {
        existingGroup.totalProfit += Number(item.ovrs_rlzt_pfls_amt);
        existingGroup.totalInvestment += Number(item.frcr_pchs_amt1);
      } else {
        acc.push({
          trad_day: item.trad_day,
          totalProfit: Number(item.ovrs_rlzt_pfls_amt),
          totalInvestment: Number(item.frcr_pchs_amt1),
        });
      }
      return acc;
    }, []);
    setDailyProfitData(groupedDailyData);

    // 월별 그룹화
    const groupedMonthlyData = profitData?.reduce((acc, item) => {
      const yearMonth = item.trad_day ? item.trad_day.substring(0, 6) : null;
      if (!yearMonth) return acc;
      const existingGroup = acc.find((group) => group.yearMonth === yearMonth);
      if (existingGroup) {
        existingGroup.totalProfit += Number(item.ovrs_rlzt_pfls_amt);
        existingGroup.totalInvestment += Number(item.frcr_pchs_amt1);
        if (!existingGroup.tradingDays.includes(item.trad_day)) {
          existingGroup.tradingDays.push(item.trad_day);
        }
      } else {
        acc.push({
          yearMonth,
          totalProfit: Number(item.ovrs_rlzt_pfls_amt),
          totalInvestment: Number(item.frcr_pchs_amt1),
          tradingDays: [item.trad_day],
        });
      }
      return acc;
    }, []);
    setMonthlyProfitData(groupedMonthlyData);

    // 총 매매손익 계산
    const totalProfitData = profitData?.reduce(
      (acc, item) => {
        acc.totalProfit += Number(item.ovrs_rlzt_pfls_amt);
        acc.totalInvestment += Number(item.frcr_pchs_amt1);
        return acc;
      },
      { totalProfit: 0, totalInvestment: 0 }
    );
    setTotalProfit(totalProfitData);
  }, [profitData]);

  const data = useMemo(() => {
    if (profitType === 'individual') {
      return profitData;
    } else if (profitType === 'daily') {
      return dailyProfitData;
    } else if (profitType === 'monthly') {
      return monthlyProfitData;
    }
    return [];
  }, [profitType, profitData, dailyProfitData, monthlyProfitData]);

  return {
    profitData: data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError || !!error,
    error: query.error?.message || error,
    dailyProfitData,
    monthlyProfitData,
    totalProfit,
    profitType,
    setProfitType,
    fetchProfitData: query.refetch, // 인터페이스 유지를 위한 함수명 유지
    isFetching: query.isFetching,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
};

export default useProfit;
