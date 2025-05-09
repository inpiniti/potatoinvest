'use client';

import useAccount from '@/hooks/useAccount';
import useApi from '@/hooks/useApi';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { logos } from '@/json/logoData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react'; // 로딩 아이콘 추가
// 새로 추가할 탭 컴포넌트 임포트
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Sell = () => {
  const api = useApi();

  const [cano, acntPrdtCd] = useAccount();
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState('02');
  const [list, setList] = useState([]);
  const [expandedRows, setExpandedRows] = useState({}); // 행 확장 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 뷰 타입 상태 (일별/월별)
  const [viewType, setViewType] = useState('daily');

  /**
   * 매매 내역을 조회하는 함수
   *
   * 동작:
   * 1. 계좌번호와 상품코드가 유효한지 확인
   * 2. API 호출에 필요한 payload 준비
   * 3. API를 통해 매매 내역 데이터 조회
   * 4. 조회된 데이터에 로고 정보 추가
   * 5. 상태 업데이트
   *
   * @returns {Promise<void>} 비동기 작업이 완료되면 해결되는 Promise
   */
  const getList = useCallback(async () => {
    try {
      setLoading(true); // 로딩 시작
      let allData = []; // 모든 페이지의 데이터를 저장할 배열
      let hasMore = true; // 더 많은 데이터가 있는지 여부
      let ctxAreaNk200 = ''; // 연속 조회 키
      let ctxAreaFk200 = ''; // 연속 조회 검색 조건

      if (cano && acntPrdtCd) {
        // 모든 페이지를 가져올 때까지 반복
        while (hasMore) {
          const payload = {
            CANO: cano,
            ACNT_PRDT_CD: acntPrdtCd,
            OVRS_EXCG_CD: 'NASD',
            NATN_CD: '', // 국가코드 : 공란
            CRCY_CD: '', // 통화코드 : 공란
            PDNO: '', // 상품번호 : 공란
            INQR_STRT_DT: '20250301', // 조회시작일자: 1달 전
            INQR_END_DT: dayjs().format('YYYYMMDD'), // 조회종료일자: 오늘
            WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
            CTX_AREA_FK200: ctxAreaFk200, // 연속조회검색조건200 : 공란
            CTX_AREA_NK200: ctxAreaNk200, // 연속조회키200 : 이전 응답에서 받은 값
          };

          const response = await api.trading.inquirePeriodProfit(payload);
          const data = await response.json();

          // 응답 데이터 확인 및 로깅
          console.log('API 응답:', data);

          if (data?.output1?.length > 0) {
            // 현재 페이지 데이터 처리
            const currentPageData = data.output1.map((item) => {
              // 종목에 맞는 로고 찾기
              const logoItem = logos.find(
                (logo) => logo.name === item.ovrs_pdno
              );
              return {
                ...item,
                logo: logoItem?.logoid || '',
              };
            });

            // 전체 데이터에 현재 페이지 데이터 추가
            allData = [...allData, ...currentPageData];

            // 연속 조회 키가 있는지 확인
            if (data.ctx_area_nk200 && data.ctx_area_nk200.trim() !== '') {
              ctxAreaNk200 = data.ctx_area_nk200; // 다음 페이지 조회 시 사용할 키 업데이트
              console.log('다음 페이지 조회 키:', ctxAreaNk200);
              ctxAreaFk200 = data.ctx_area_fk200; // 다음 페이지 조회 시 사용할 검색 조건 업데이트
              console.log('다음 페이지 조회 조건:', ctxAreaFk200);
            } else {
              // 연속 조회 키가 없으면 모든 데이터를 가져온 것
              hasMore = false;
            }
          } else {
            // 더 이상 데이터가 없음
            hasMore = false;
          }
        }

        console.log(`총 ${allData.length}개의 매매 내역을 가져왔습니다.`);
        setList(allData);
      }
    } catch (error) {
      console.error('매매 내역 조회 중 오류:', error);
      alert('매매 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, []);

  /**
   * 컴포넌트 마운트 시 매매 내역을 조회합니다.
   */
  useEffect(() => {
    getList();

    // 무한 로딩이 되기 떄문에 빈 배열을 넣어줌
  }, []);

  /**
   * 특정 행의 확장 상태를 토글합니다.
   *
   * @param {string} rowKey - 토글할 행의 고유 키
   */
  const toggleRow = (rowKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  /**
   * 매매일 기준으로 데이터를 그룹화합니다.
   * 각 그룹마다 총 수익과 총 투자금액을 계산합니다.
   *
   * @type {Array<Object>} 그룹화된 데이터
   */
  const groupedData = list?.reduce((acc, item) => {
    const existingGroup = acc.find((group) => group.trad_day === item.trad_day);
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

  /**
   * 그룹화된 데이터에 수익률을 추가합니다.
   * 수익률은 소수점 2자리까지만 표시합니다.
   *
   * @type {Array<Object>} 수익률이 추가된 데이터
   */
  const groupedWithYield = groupedData?.map((group) => ({
    trad_day: group.trad_day,
    totalProfit: group.totalProfit,
    yield: group.totalInvestment
      ? (
          Math.floor((group.totalProfit / group.totalInvestment) * 100 * 100) /
          100
        ).toFixed(2)
      : '0.00',
  }));

  /**
   * 숫자에 천 단위로 쉼표를 추가합니다.
   *
   * @param {number} number - 포맷할 숫자
   * @returns {string} 포맷된 문자열
   */
  const formatNumber = (number) => {
    return Math.floor(number)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * 수익률을 소수점 2자리까지만 표시합니다.
   *
   * @param {number|string} rate - 포맷할 수익률
   * @returns {string} 포맷된 수익률 문자열
   */
  const formatRate = (rate) => {
    return (Math.floor(parseFloat(rate) * 100) / 100).toFixed(2);
  };

  /**
   * 매매일 기준으로 데이터를 그룹화합니다.
   * 각 그룹마다 총 수익과 총 투자금액을 계산합니다.
   */
  const groupedDailyData = list?.reduce((acc, item) => {
    const existingGroup = acc.find((group) => group.trad_day === item.trad_day);
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

  /**
   * 월별로 데이터를 그룹화합니다.
   * 각 월마다 총 수익과 총 투자금액을 계산합니다.
   */
  const groupedMonthlyData = list?.reduce((acc, item) => {
    // 'YYYYMMDD' 형식에서 'YYYYMM' 추출
    const yearMonth = item.trad_day ? item.trad_day.substring(0, 6) : null;
    if (!yearMonth) return acc;

    const existingGroup = acc.find((group) => group.yearMonth === yearMonth);
    if (existingGroup) {
      existingGroup.totalProfit += Number(item.ovrs_rlzt_pfls_amt);
      existingGroup.totalInvestment += Number(item.frcr_pchs_amt1);
      // 해당 월에 포함된 거래일 목록 업데이트
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

  /**
   * 그룹화된 데이터에 수익률을 추가합니다.
   */
  const groupedDailyWithYield = groupedDailyData?.map((group) => ({
    trad_day: group.trad_day,
    totalProfit: group.totalProfit,
    yield: group.totalInvestment
      ? (
          Math.floor((group.totalProfit / group.totalInvestment) * 100 * 100) /
          100
        ).toFixed(2)
      : '0.00',
  }));

  /**
   * 월별 그룹화된 데이터에 수익률을 추가합니다.
   */
  const groupedMonthlyWithYield = groupedMonthlyData?.map((group) => ({
    yearMonth: group.yearMonth,
    totalProfit: group.totalProfit,
    yield: group.totalInvestment
      ? (
          Math.floor((group.totalProfit / group.totalInvestment) * 100 * 100) /
          100
        ).toFixed(2)
      : '0.00',
    tradingDays: group.tradingDays,
  }));

  return (
    <div className="w-full">
      {/* 탭 추가 */}
      <Tabs defaultValue="daily" className="w-full" onValueChange={setViewType}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="daily">일별 조회</TabsTrigger>
            <TabsTrigger value="monthly">월별 조회</TabsTrigger>
          </TabsList>
        </div>

        <div className="border rounded-md !bg-white">
          {loading ? (
            // 로딩 상태 표시
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-500">매매 내역을 불러오는 중입니다...</p>
            </div>
          ) : (
            <>
              {/* 일별 조회 컨텐츠 */}
              <TabsContent value="daily" className="mt-0">
                {groupedDailyWithYield?.length > 0 ? (
                  <DailyView
                    groupedData={groupedDailyWithYield}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    list={list}
                    formatNumber={formatNumber}
                    formatRate={formatRate}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 p-4">
                    <p className="text-gray-500">매매 내역이 없습니다.</p>
                  </div>
                )}
              </TabsContent>

              {/* 월별 조회 컨텐츠 */}
              <TabsContent value="monthly" className="mt-0">
                {groupedMonthlyWithYield?.length > 0 ? (
                  <MonthlyView
                    groupedData={groupedMonthlyWithYield}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    list={list}
                    formatNumber={formatNumber}
                    formatRate={formatRate}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 p-4">
                    <p className="text-gray-500">매매 내역이 없습니다.</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

// 일별 조회 컴포넌트
const DailyView = ({
  groupedData,
  expandedRows,
  toggleRow,
  list,
  formatNumber,
  formatRate,
}) => {
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">매매일</TableHead>
          <TableHead className="text-center">실현손익금액</TableHead>
          <TableHead className="text-center">수익률</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedData?.map((item) => (
          <>
            <TableRow
              key={item?.trad_day}
              onClick={() => toggleRow(item?.trad_day)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>
                {item?.trad_day &&
                  dayjs(item?.trad_day).format('YYYY년 MM월 DD일')}
              </TableCell>
              <TableCell
                className={
                  item?.totalProfit > 0
                    ? 'text-red-500'
                    : item?.totalProfit < 0
                    ? 'text-blue-500'
                    : ''
                }
              >
                {formatNumber(item?.totalProfit)}원
              </TableCell>
              <TableCell
                className={
                  parseFloat(item?.yield) > 0
                    ? 'text-red-500'
                    : parseFloat(item?.yield) < 0
                    ? 'text-blue-500'
                    : ''
                }
              >
                {item?.yield}%
              </TableCell>
            </TableRow>
            {expandedRows[item?.trad_day] && (
              <DetailRow
                tradDay={item?.trad_day}
                list={list}
                formatNumber={formatNumber}
                formatRate={formatRate}
              />
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
};

// 월별 조회 컴포넌트
const MonthlyView = ({
  groupedData,
  expandedRows,
  toggleRow,
  list,
  formatNumber,
  formatRate,
}) => {
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">매매월</TableHead>
          <TableHead className="text-center">실현손익금액</TableHead>
          <TableHead className="text-center">수익률</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedData?.map((item) => (
          <>
            <TableRow
              key={item?.yearMonth}
              onClick={() => toggleRow(item?.yearMonth)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>
                {dayjs(item?.yearMonth + '01').format('YYYY년 MM월')}
              </TableCell>
              <TableCell
                className={
                  item?.totalProfit > 0
                    ? 'text-red-500'
                    : item?.totalProfit < 0
                    ? 'text-blue-500'
                    : ''
                }
              >
                {formatNumber(item?.totalProfit)}원
              </TableCell>
              <TableCell
                className={
                  parseFloat(item?.yield) > 0
                    ? 'text-red-500'
                    : parseFloat(item?.yield) < 0
                    ? 'text-blue-500'
                    : ''
                }
              >
                {item?.yield}%
              </TableCell>
            </TableRow>
            {expandedRows[item?.yearMonth] && (
              <TableRow>
                <TableCell colSpan={3} className="bg-gray-100 p-0">
                  <div className="p-4">
                    <h4 className="font-medium mb-2">
                      {dayjs(item?.yearMonth + '01').format('YYYY년 MM월')} 거래
                      내역
                    </h4>
                    {item.tradingDays.map((tradDay) => (
                      <div key={tradDay} className="mb-4">
                        <h5 className="text-sm font-medium mb-2 pb-1 border-b">
                          {dayjs(tradDay).format('MM월 DD일')} 거래
                        </h5>
                        <DetailRow
                          tradDay={tradDay}
                          list={list}
                          formatNumber={formatNumber}
                          formatRate={formatRate}
                        />
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
};

// 상세 거래 행 컴포넌트 (재사용)
const DetailRow = ({ tradDay, list, formatNumber, formatRate }) => {
  return (
    <TableRow>
      <TableCell colSpan={3} className="bg-gray-100 p-0">
        <Table className="w-full">
          <TableHeader className="bg-gray-50 border-b">
            <TableRow>
              <TableHead className="text-center w-16">로고</TableHead>
              <TableHead className="text-center">종목코드</TableHead>
              <TableHead className="text-center">실현손익금액</TableHead>
              <TableHead className="text-center">수익률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list
              ?.filter((_item) => _item.trad_day === tradDay)
              .map((item) => (
                <TableRow key={item?.ovrs_pdno}>
                  <TableCell className="items-center justify-center flex">
                    <Avatar className="border w-8 h-8">
                      <AvatarImage
                        src={`https://s3-symbol-logo.tradingview.com/${item.logo}--big.svg`}
                        alt={item.ovrs_pdno}
                      />
                      <AvatarFallback>
                        {item.ovrs_pdno?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{item.ovrs_pdno}</TableCell>
                  <TableCell
                    className={
                      Number(item?.ovrs_rlzt_pfls_amt) > 0
                        ? 'text-red-500'
                        : Number(item?.ovrs_rlzt_pfls_amt) < 0
                        ? 'text-blue-500'
                        : ''
                    }
                  >
                    {formatNumber(item?.ovrs_rlzt_pfls_amt)}원
                  </TableCell>
                  <TableCell
                    className={
                      Number(item.pftrt) > 0
                        ? 'text-red-500'
                        : Number(item.pftrt) < 0
                        ? 'text-blue-500'
                        : ''
                    }
                  >
                    {formatRate(item.pftrt)}%
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableCell>
    </TableRow>
  );
};

export default Sell;
