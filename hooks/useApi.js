import { keyStore } from "@/store/keyStore";
import { tempKeyStore } from "@/store/tempKeyStore";

const useApi = () => {
  const { key } = keyStore();
  const { key: tempKey, realKey } = tempKeyStore();

  const _fetch = ({ url, payload, _isVts }) => {
    const { appKey, secretKey } = key;
    const { vtsAppKey, vtsSecretKey } = key;
    const { isVts } = key;

    // 넘겨받은 vts를 더 우선시함
    const newIsVts = _isVts ?? isVts;

    const _payload = {
      isVts: newIsVts,
      appkey: newIsVts ? vtsAppKey : appKey,
      appsecret: newIsVts ? vtsSecretKey : secretKey,
      solt: tempKey.password,
      ...payload,
      ...(payload !== undefined && {
        token: newIsVts ? tempKey.access_token : realKey.access_token,
      }),
    };

    try {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(_payload),
      });
    } catch (error) {
      console.error("error", error);
      throw error;
    }
  };

  const api = {
    oauth2: {
      tokenP: () => _fetch({ url: "/api/koreainvestment/oauth2/tokenP" }),
      tokenR: () =>
        _fetch({ url: "/api/koreainvestment/oauth2/tokenP", _isVts: false }), // 실전투자용도 필요함.
      // 웹 소켓 토큰 발급
      approval: () =>
        _fetch({ url: "/api/koreainvestment/oauth2/approval", _isVts: false }),
    },
    quotations: {
      price: ({ excd, symb }) =>
        _fetch({
          url: "/api/koreainvestment/quotations/price",
          payload: { excd, symb },
        }),
      // 기간별 시세
      dailyprice: ({ excd, symb, gubn, modp }) =>
        _fetch({
          url: "/api/koreainvestment/quotations/dailyprice",
          payload: { excd, symb, gubn, modp },
        }),
      // 해외주식조건검색
      inquireSearch: (payload) =>
        _fetch({
          url: "/api/koreainvestment/quotations/inquireSearch",
          payload,
        }),
      // 해외주식 현재가상세
      priceDetail: (payload) =>
        _fetch({
          url: "/api/koreainvestment/quotations/priceDetail",
          payload,
          _isVts: false,
        }),
      // 해외주식 상품기본정보
      searchInfo: (payload) =>
        _fetch({
          url: "/api/koreainvestment/quotations/searchInfo",
          payload,
          _isVts: false,
        }),
    },
    trading: {
      order: (payload) =>
        _fetch({ url: "/api/koreainvestment/trading/order", payload }), // 해외주식 주문
      orderRvsecncl: (payload) =>
        _fetch({ url: "/api/koreainvestment/trading/orderRvsecncl", payload }), // 해외주식 정정취소주문
      orderResv: (payload) =>
        _fetch({ url: "/api/koreainvestment/trading/orderResv", payload }), // 해외주식 예약주문접수
      orderResvCcnl: (payload) =>
        _fetch({ url: "/api/koreainvestment/trading/orderResvCcnl", payload }), // 해외주식 예약주문접수취소
      inquireNccs: (payload) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquireNccs",
          payload,
          _isVts: false,
        }), // 해외주식 미체결내역
      inquireBalance: ({
        CANO, // 종합계좌번호 ex) 810XXXXX
        ACNT_PRDT_CD, // 계좌상품코드 ex) 01
        OVRS_EXCG_CD, // 해외거래소코드 ex) NASD, NYSE, AMEX
        TR_CRCY_CD, // 통화코드 ex) USD
        CTX_AREA_FK200, // 연속조회검색조건200 ex) ''
        CTX_AREA_NK200, // 연속조회키200 ex) ''
      }) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquireBalance",
          payload: {
            CANO,
            ACNT_PRDT_CD,
            OVRS_EXCG_CD,
            TR_CRCY_CD,
            CTX_AREA_FK200,
            CTX_AREA_NK200,
          },
        }), // 해외주식 잔고
      inquireCcnl: ({
        CANO,
        ACNT_PRDT_CD,
        OVRS_EXCG_CD,
        PDNO,
        ORD_STRT_DT,
        ORD_END_DT,
        SLL_BUY_DVSN,
        CCLD_NCCS_DVSN,
        SORT_SQN,
        ORD_DT,
        ORD_GNO_BRNO,
        ODNO,
        CTX_AREA_NK200,
        CTX_AREA_FK200,
      }) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquireCcnl",
          payload: {
            CANO,
            ACNT_PRDT_CD,
            OVRS_EXCG_CD,
            PDNO,
            ORD_STRT_DT,
            ORD_END_DT,
            SLL_BUY_DVSN,
            CCLD_NCCS_DVSN,
            SORT_SQN,
            ORD_DT,
            ORD_GNO_BRNO,
            ODNO,
            CTX_AREA_NK200,
            CTX_AREA_FK200,
          },
        }), // 해외주식 주문체결내역
      inquirePresentBalance: (payload) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquirePresentBalance",
          payload,
        }), // 해외주식 체결기준현재잔고
      //inquireResv: () => {}, // 해외주식 예약주문조회
      inquireBuyableAmount: (payload) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquireBuyableAmount",
          payload,
        }), // 해외주식 매수가능금액조회
      // 해외주식 기간손익
      inquirePeriodProfit: (payload) =>
        _fetch({
          url: "/api/koreainvestment/trading/inquirePeriodProfit",
          payload,
          _isVts: false,
        }),
    },
  };

  return api;
};

export default useApi;
