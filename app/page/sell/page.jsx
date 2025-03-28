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

const Sell = () => {
  const api = useApi();

  const [cano, acntPrdtCd] = useAccount();
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState('02');
  const [list, setList] = useState([]);
  const [expandedRows, setExpandedRows] = useState({}); // 추가된 상태

  const getList = useCallback(async () => {
    try {
      alert('cano : ' + String(cano));
      alert('acntPrdtCd : ' + String(acntPrdtCd));
      if (cano && acntPrdtCd) {
        const payload = {
          CANO: cano,
          ACNT_PRDT_CD: acntPrdtCd,
          OVRS_EXCG_CD: 'NASD',
          NATN_CD: '', // 국가코드 : 공란
          CRCY_CD: '', // 통화코드 : 공란
          PDNO: '', // 상품번호 : 공란
          INQR_STRT_DT: dayjs('2025.03.25').format('YYYYMMDD'), // 조회시작일자
          INQR_END_DT: dayjs().format('YYYYMMDD'), // 조회종료일자
          WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
          CTX_AREA_FK200: '', // 연속조회검색조건200 : 공란
          CTX_AREA_NK200: '', // 연속조회키200 : 공란
        };

        alert('payload : ' + JSON.stringify(payload));

        const response = await api.trading.inquirePeriodProfit(payload);

        alert('response : ' + JSON.stringify(response));

        const data = await response.json();

        alert('data : ' + JSON.stringify(data));

        setList(
          data?.output1?.map((item) => {
            const logo = logos.find(
              (logo) => logo.name === item.ovrs_pdno
            ).logoid;
            return {
              ...item,
              logo,
            };
          })
        );
      }
    } catch (error) {
      alert(error);
    }
  }, []);

  useEffect(() => {
    alert('getList()');
    getList();
  }, []);

  const toggleRow = (rowKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

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

  const groupedWithYield = groupedData?.map((group) => ({
    trad_day: group.trad_day,
    totalProfit: group.totalProfit,
    yield: group.totalInvestment
      ? ((group.totalProfit / group.totalInvestment) * 100).toFixed(2)
      : '0.00',
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 text-center">
      <div className="border rounded-md !bg-white">
        <Table>
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
                >
                  <TableCell>
                    {item?.trad_day &&
                      dayjs(item?.trad_day).format('YYYY년 MM월 DD일')}
                  </TableCell>
                  <TableCell>
                    {item?.totalProfit &&
                      Math.floor(item?.totalProfit)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    원
                  </TableCell>
                  <TableCell>{item?.yield}%</TableCell>
                </TableRow>
                {expandedRows[item?.trad_day] && (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-gray-100 p-0">
                      <Table>
                        <TableHeader className="bg-gray-50 border-b">
                          <TableHead className="text-center">로고</TableHead>
                          <TableHead className="text-center">
                            종목코드
                          </TableHead>
                          <TableHead className="text-center">종목명</TableHead>
                          <TableHead className="text-center">
                            실현손익금액
                          </TableHead>
                          <TableHead className="text-center">수익률</TableHead>
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
                                      alt="@radix-vue"
                                    />
                                    <AvatarFallback>
                                      {item.ovrs_pdno?.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>
                                <TableCell>{item.ovrs_pdno}</TableCell>
                                <TableCell>{item.ovrs_item_name}</TableCell>
                                <TableCell>
                                  {item?.ovrs_rlzt_pfls_amt &&
                                    Math.floor(item?.ovrs_rlzt_pfls_amt)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  원
                                </TableCell>
                                <TableCell>{item.pftrt}</TableCell>
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
      </div>
    </div>
  );
};
export default Sell;
