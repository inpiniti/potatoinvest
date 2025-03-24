import { delay } from '@/utils/util';
import useAccount from './useAccount';
import useApi from './useApi';

const useTrading = () => {
  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  // 주식잔고 확인
  const 주식잔고확인 = async () => {
    const payload = {
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: 'NASD',
      TR_CRCY_CD: 'USD',
      CTX_AREA_FK200: '',
      CTX_AREA_NK200: '',
    };

    const response = await api.trading.inquireBalance(payload);
    const data = await response.json();

    if (response.status !== 200) {
      console.error('주식잔고 확인 실패', response.status, data);
      return false;
    }

    if (data?.output1) return data?.output1;
    else return false;
  };

  interface Item {
    evlu_pfls_rt: number;
  }

  const 매도확인 = async (item: Item) => {
    await delay(500);
    return Number(item.evlu_pfls_rt) > 2;
  };

  const 물타기확인 = async (item: Item) => {
    await delay(500);
    return Number(item.evlu_pfls_rt) < -2;
  };

  return { 주식잔고확인, 매도확인, 물타기확인 };
};

export default useTrading;
