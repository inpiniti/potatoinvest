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

const Sell = () => {
  const api = useApi();

  const [cano, acntPrdtCd] = useAccount();
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState('02');
  const [list, setList] = useState([]);
  const [expandedRows, setExpandedRows] = useState({}); // 행 확장 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

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

      if (cano && acntPrdtCd) {
        const payload = {
          CANO: cano,
          ACNT_PRDT_CD: acntPrdtCd,
          OVRS_EXCG_CD: 'NASD',
          NATN_CD: '', // 국가코드 : 공란
          CRCY_CD: '', // 통화코드 : 공란
          PDNO: '', // 상품번호 : 공란
          INQR_STRT_DT: dayjs().subtract(1, 'month').format('YYYYMMDD'), // 조회시작일자: 1달 전
          INQR_END_DT: dayjs().format('YYYYMMDD'), // 조회종료일자: 오늘
          WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
          CTX_AREA_FK200: '', // 연속조회검색조건200 : 공란
          CTX_AREA_NK200: '', // 연속조회키200 : 공란
        };

        const response = await api.trading.inquirePeriodProfit(payload);

        const data = await response.json();

        // 로고 정보 추가
        const enrichedData =
          data?.output1?.map((item) => {
            // 종목에 맞는 로고 찾기
            const logoItem = logos.find((logo) => logo.name === item.ovrs_pdno);
            return {
              ...item,
              logo: logoItem?.logoid || '',
            };
          }) || [];

        setList(enrichedData);
      }
    } catch (error) {
      console.error('매매 내역 조회 중 오류:', error);
      alert('매매 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 종료
    }

    // 무한 로딩이 되기 떄문에 빈 배열을 넣어줌
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

  return (
    <div className="w-full">
      <div className="border rounded-md !bg-white">
        // 리턴값에 ctx_area_nk200 이게 있다면 다시 루프면 돌면 좋을듯..
        {loading ? (
          // 로딩 상태 표시
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500">매매 내역을 불러오는 중입니다...</p>
          </div>
        ) : groupedWithYield?.length > 0 ? (
          // 데이터가 있을 경우 테이블 표시
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">매매일</TableHead>
                <TableHead className="text-center">실현손익금액</TableHead>
                <TableHead className="text-center">수익률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedWithYield?.map((item) => (
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
                    <TableRow>
                      <TableCell colSpan={3} className="bg-gray-100 p-0">
                        <Table className="w-full">
                          <TableHeader className="bg-gray-50 border-b">
                            <TableRow>
                              <TableHead className="text-center w-16">
                                로고
                              </TableHead>
                              <TableHead className="text-center">
                                종목코드
                              </TableHead>
                              {/* 종목명 컬럼 제거 */}
                              <TableHead className="text-center">
                                실현손익금액
                              </TableHead>
                              <TableHead className="text-center">
                                수익률
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {list
                              ?.filter(
                                (_item) => _item.trad_day === item?.trad_day
                              )
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
                                  {/* 종목명 셀 제거 */}
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
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        ) : (
          // 데이터가 없을 경우 메시지 표시
          <div className="flex items-center justify-center h-64 p-4">
            <p className="text-gray-500">매매 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sell;
