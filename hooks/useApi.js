import { keyStore } from '@/store/keyStore';
import { tempKeyStore } from '@/store/tempKeyStore';

const useApi = () => {
  const { key } = keyStore();
  const { key: tempKey } = tempKeyStore();

  const _fetch = ({ url, payload }) => {
    const { appKey, secretKey } = key;
    const { vtsAppKey, vtsSecretKey } = key;
    const { isVts } = key;

    const _payload = {
      isVts,
      appkey: isVts ? vtsAppKey : appKey,
      appsecret: isVts ? vtsSecretKey : secretKey,
      solt: tempKey.password,
      ...payload,
      ...(payload !== undefined && { token: tempKey.access_token }),
    };

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(_payload),
    });
  };

  const api = {
    oauth2: {
      tokenP: () => _fetch({ url: '/api/koreainvestment/oauth2/tokenP' }),
    },
    quotations: {
      dailyprice: ({ excd, symb, gubn, modp }) =>
        _fetch({
          url: '/api/koreainvestment/quotations/dailyprice',
          payload: { excd, symb, gubn, modp },
        }),
      price: ({ excd, symb }) =>
        _fetch({
          url: '/api/koreainvestment/quotations/price',
          payload: { excd, symb },
        }),
      inquireSearch: (payload) =>
        _fetch({
          url: '/api/koreainvestment/quotations/inquireSearch',
          payload,
        }), // 해외주식 주문
    },
    trading: {
      order: (payload) =>
        _fetch({ url: '/api/koreainvestment/trading/order', payload }), // 해외주식 주문
      orderRvsecncl: (payload) =>
        _fetch({ url: '/api/koreainvestment/trading/orderRvsecncl', payload }), // 해외주식 정정취소주문
      orderResv: (payload) =>
        _fetch({ url: '/api/koreainvestment/trading/orderResv', payload }), // 해외주식 예약주문접수
      orderResvCcnl: (payload) =>
        _fetch({ url: '/api/koreainvestment/trading/orderResvCcnl', payload }), // 해외주식 예약주문접수취소
      //inquireNccs: () => {}, // 해외주식 미체결내역
      inquireBalance: ({
        CANO, // 종합계좌번호 ex) 810XXXXX
        ACNT_PRDT_CD, // 계좌상품코드 ex) 01
        OVRS_EXCG_CD, // 해외거래소코드 ex) NASD, NYSE, AMEX
        TR_CRCY_CD, // 통화코드 ex) USD
        CTX_AREA_FK200, // 연속조회검색조건200 ex) ''
        CTX_AREA_NK200, // 연속조회키200 ex) ''
      }) =>
        _fetch({
          url: '/api/koreainvestment/trading/inquireBalance',
          payload: {
            CANO,
            ACNT_PRDT_CD,
            OVRS_EXCG_CD,
            TR_CRCY_CD,
            CTX_AREA_FK200,
            CTX_AREA_NK200,
          },
        }), // 해외주식 잔고
      inquireCcnl: (payload) =>
        _fetch({ url: '/api/koreainvestment/trading/inquireCcnl', payload }), // 해외주식 주문체결내역
      inquirePresentBalance: (payload) =>
        _fetch({
          url: '/api/koreainvestment/trading/inquirePresentBalance',
          payload,
        }), // 해외주식 체결기준현재잔고
      //inquireResv: () => {}, // 해외주식 예약주문조회
      inquireBuyableAmount: (payload) =>
        _fetch({
          url: '/api/koreainvestment/trading/inquireBuyableAmount',
          payload,
        }), // 해외주식 매수가능금액조회
    },
  };

  return api;
};

export default useApi;
