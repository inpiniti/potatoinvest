'use client';

import useAccount from '@/hooks/useAccount';
import useApi from '@/hooks/useApi';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { logos } from '@/json/logoData';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sell = () => {
  const api = useApi();

  const [cano, acntPrdtCd] = useAccount();
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState('02');
  const [list, setList] = useState([]);

  const getList = useCallback(async () => {
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

      const response = await api.trading.inquirePeriodProfit(payload);
      const data = await response.json();

      setList(data);
    }
  }, []);

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {list?.output1?.map((item, index) => {
        const logo = logos.find((logo) => logo.name === item.ovrs_pdno);
        return (
          <Card
            key={index}
            className="flex flex-row px-6 gap-2 items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Avatar className="border w-12 h-12">
                <AvatarImage
                  src={`https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`}
                  alt="@radix-vue"
                  className="w-12 h-12"
                />
                <AvatarFallback>{item.ovrs_pdno?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="font-bold text-2xl">{item.ovrs_pdno}</div>
                <div className="text-neutral-400">{item.ovrs_item_name}</div>
              </div>
            </div>
            <div>매매일 {item.trad_day}</div>
            <div>매도청산수량 {item.slcl_qty}</div>
            <div>매입평균가격 {item.pchs_avg_pric}</div>
            <div>외화매입금액1 {item.frcr_pchs_amt1}</div>
            <div>평균매도단가 {item.avg_sll_unpr}</div>
            <div>외화매도금액합계1 {item.frcr_sll_amt_smtl1}</div>
            <div>주식매도제비용 {item.stck_sll_tlex}</div>
            <div>해외실현손익금액 {item.ovrs_rlzt_pfls_amt}</div>
            <div>수익률 {item.pftrt}</div>
            <div>환율 {item.exrt}</div>

            <div>해외거래소코드 {item.ovrs_excg_cd}</div>
            <div>최초고시환율 {item.frst_bltn_exrt}</div>
          </Card>
        );
      })}
    </div>
  );
};
export default Sell;
