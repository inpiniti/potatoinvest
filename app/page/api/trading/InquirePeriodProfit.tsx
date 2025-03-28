import { Button } from '@/components/ui/button';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { useState } from 'react';
import ApiContent from '../ApiContent';
import useApi from '@/hooks/useApi';
import CANO_COMPONENT from './common/CANO_COMPONENT';
import ACNT_PRDT_CD_COMPONENT from './common/ACNT_PRDT_CD_COMPONENT';
import OVRS_EXCG_CD_COMPONENT from './common/OVRS_EXCG_CD_COMPONENT';
import TAB_COMPONENT from './common/TAB_COMPONENT';
import DATE_COMPONENT from './common/DATE_COMPONENT';
import INPUT_COMPONENT from './common/INPUT_COMPONENT';

const InquirePeriodProfit = () => {
  const api = useApi();

  const [result, setResult] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [CANO, setCANO] = useState('');
  const [ACNT_PRDT_CD, setACNT_PRDT_CD] = useState('');
  const [OVRS_EXCG_CD, setOVRS_EXCG_CD] = useState('NASD');
  const [NATN_CD] = useState('');
  const [CRCY_CD] = useState('');
  const [PDNO] = useState('');
  const [INQR_STRT_DT, setINQR_STRT_DT] = useState('');
  const [INQR_END_DT, setINQR_END_DT] = useState('');
  const [WCRC_FRCR_DVSN_CD, setWCRC_FRCR_DVSN_CD] = useState('');
  const [CTX_AREA_FK200] = useState('');
  const [CTX_AREA_NK200] = useState('');

  const payload = {
    CANO,
    ACNT_PRDT_CD,
    OVRS_EXCG_CD,
    NATN_CD, // 국가코드 : 공란
    CRCY_CD, // 통화코드 : 공란
    PDNO, // 상품번호 : 공란
    INQR_STRT_DT, // 조회시작일자
    INQR_END_DT, // 조회종료일자
    WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
    CTX_AREA_FK200, // 연속조회검색조건200 : 공란
    CTX_AREA_NK200, // 연속조회키200 : 공란
  };

  const handleButtonClick = async () => {
    try {
      const response = await api.trading.inquirePeriodProfit(payload);
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
      setIsOpen(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 기간손익"
      endPoint="/trading/inquirePeriodProfit"
      disabled={false}
      result={result}
    >
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>다음정보를 입력해주세요.</DrawerTitle>
            <DrawerDescription>
              거래소 코드와 종목코드는 필수 입니다.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-4">
            <CANO_COMPONENT value={CANO} onChange={setCANO} />
            <ACNT_PRDT_CD_COMPONENT
              value={ACNT_PRDT_CD}
              onChange={setACNT_PRDT_CD}
            />
            <OVRS_EXCG_CD_COMPONENT
              value={OVRS_EXCG_CD}
              onChange={setOVRS_EXCG_CD}
            />
            {typeof window !== 'undefined' &&
            /Mobi|Android/i.test(navigator.userAgent) ? (
              <>
                <INPUT_COMPONENT
                  value={INQR_STRT_DT}
                  onChange={setINQR_STRT_DT}
                  title="조회시작일자"
                  column="INQR_STRT_DT"
                />
                <INPUT_COMPONENT
                  value={INQR_END_DT}
                  onChange={setINQR_END_DT}
                  title="조회종료일자"
                  column="INQR_END_DT"
                />
              </>
            ) : (
              <>
                <DATE_COMPONENT
                  value={INQR_STRT_DT}
                  onChange={setINQR_STRT_DT}
                  title="조회시작일자"
                  column="INQR_STRT_DT"
                />
                <DATE_COMPONENT
                  value={INQR_END_DT}
                  onChange={setINQR_END_DT}
                  title="조회종료일자"
                  column="INQR_END_DT"
                />
              </>
            )}
            <TAB_COMPONENT
              value={WCRC_FRCR_DVSN_CD}
              onChange={setWCRC_FRCR_DVSN_CD}
              title="원화외화구분코드 (01: 외화, 02: 원화)"
              column="WCRC_FRCR_DVSN_CD"
              items={['01', '02']}
            />
          </div>
          <DrawerFooter>
            <div className="flex items-center justify-end w-full gap-4">
              <Button onClick={handleButtonClick}>조회</Button>
              <DrawerClose>
                <Button variant="outline">취소</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ApiContent>
  );
};

export default InquirePeriodProfit;
