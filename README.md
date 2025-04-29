# PotatoInvest

## useApi 훅 사용 방법

PotatoInvest 애플리케이션에서는 한국투자증권 API 호출을 간소화하기 위해 `useApi` 커스텀 훅을 제공합니다. 이 훅을 사용하면 인증 처리, 에러 핸들링, 토큰 관리 등이 자동으로 처리됩니다.

### useApi 훅 기본 사용법

```javascript
import useApi from "@/hooks/useApi";

function MyComponent() {
  const api = useApi();

  const handleFetchData = async () => {
    try {
      // 토큰 발급
      const tokenResponse = await api.oauth2.tokenP();

      // 현재가 조회
      const priceData = await api.quotations.price({
        excd: "NAS",
        symb: "AAPL",
      });

      // 주문 실행
      const orderResult = await api.trading.order({
        // 주문 관련 파라미터
      });
    } catch (error) {
      console.error("API 호출 실패:", error);
    }
  };
}
```

### useApi에서 제공하는 주요 메서드

#### 인증 관련

- `api.oauth2.tokenP()` - 모의투자 접근 토큰을 발급받습니다.
- `api.oauth2.tokenR()` - 실전투자 접근 토큰을 발급받습니다.

#### 주식 시세 관련

- `api.quotations.price({ excd, symb })` - 특정 종목의 현재가를 조회합니다.
  - `excd`: 거래소 코드 (예: "NAS" - 나스닥)
  - `symb`: 종목 코드 (예: "AAPL" - 애플)
- `api.quotations.dailyprice({ excd, symb, gubn, modp })` - 기간별 시세 데이터를 조회합니다.
  - `gubn`: 조회 구분 (예: "D" - 일봉, "W" - 주봉, "M" - 월봉)
  - `modp`: 수정주가 여부
- `api.quotations.inquireSearch(payload)` - 해외주식 조건검색을 수행합니다.
- `api.quotations.priceDetail(payload)` - 해외주식 현재가 상세 정보를 조회합니다.

#### 거래 관련

- `api.trading.order(payload)` - 해외주식 매수/매도 주문을 실행합니다.
- `api.trading.orderRvsecncl(payload)` - 해외주식 정정취소 주문을 실행합니다.
- `api.trading.orderResv(payload)` - 해외주식 예약주문을 접수합니다.
- `api.trading.orderResvCcnl(payload)` - 해외주식 예약주문 접수를 취소합니다.
- `api.trading.inquireNccs(payload)` - 해외주식 미체결 내역을 조회합니다.
- `api.trading.inquireBalance(params)` - 해외주식 잔고를 조회합니다.
  - `CANO`: 종합계좌번호
  - `ACNT_PRDT_CD`: 계좌상품코드
  - `OVRS_EXCG_CD`: 해외거래소코드 (예: "NASD", "NYSE", "AMEX")
  - `TR_CRCY_CD`: 통화코드 (예: "USD")
  - `CTX_AREA_FK200`: 연속조회검색조건
  - `CTX_AREA_NK200`: 연속조회키
- `api.trading.inquireCcnl(payload)` - 해외주식 주문체결 내역을 조회합니다.
- `api.trading.inquirePresentBalance(payload)` - 해외주식 체결기준 현재잔고를 조회합니다.
- `api.trading.inquireBuyableAmount(payload)` - 해외주식 매수가능금액을 조회합니다.
- `api.trading.inquirePeriodProfit(payload)` - 해외주식 기간손익을 조회합니다.

### 주의사항

- API 호출 시 인증 토큰이 자동으로 관리되며, 필요한 경우 토큰이 갱신됩니다.
- 모의투자와 실전투자 모드는 `isVts` 파라미터로 구분됩니다.
- API 응답은 각 API마다 다른 형식으로 반환될 수 있으니 API 문서를 참고하시기 바랍니다.
- 모든 API 호출은 비동기로 처리되며, Promise 객체를 반환합니다.
- AI 예측 결과는 참고용으로만 사용하시기 바랍니다.

## 토큰 관리 (useToken 훅)

PotatoInvest 애플리케이션에서는 한국투자증권 API 인증 토큰을 효율적으로 관리하기 위해 `useToken` 커스텀 훅을 제공합니다. 이 훅은 인증 토큰의 발급, 유효성 검증 및 관리 기능을 제공합니다.

### useToken 훅 기본 사용법

```javascript
import useToken from "@/hooks/useToken";

function MyComponent() {
  const { 발급된토큰확인, 토큰발급, 토큰남은시간확인 } = useToken();

  const handleAuth = async () => {
    // 토큰이 이미 발급되어 있는지 확인
    const isTokenValid = await 발급된토큰확인();

    if (!isTokenValid) {
      // 유효한 토큰이 없으면 새로 발급
      const success = await 토큰발급();
      if (!success) {
        console.error("토큰 발급 실패");
        return;
      }
    }

    // 토큰이 유효하므로 API 호출 진행
    // ...
  };
}
```

### useToken에서 제공하는 주요 메서드

- `발급된토큰확인()` - 현재 발급된 토큰이 있는지 확인하고 유효한지 검사합니다.

  - 반환값: `Promise<boolean>` - 토큰이 유효하면 true, 없거나 만료되었으면 false

- `토큰발급()` - 계정 타입(모의투자/실전)에 따라 적절한 토큰을 발급받습니다.

  - 모의투자 계정의 경우 모의투자 토큰을 발급받고, 실전 토큰도 함께 발급합니다.
  - 실전 계정의 경우 실전 토큰만 발급받습니다.
  - 반환값: `Promise<boolean>` - 발급 성공 여부

- `토큰남은시간확인()` - 현재 사용 중인 계정 타입(모의투자/실전)에 따라 토큰의 남은 유효 시간을 확인합니다.
  - 반환값: `Promise<boolean>` - 토큰이 아직 유효하면 true, 만료되었으면 false

### 토큰 저장 및 관리

useToken 훅은 내부적으로 다음 두 개의 저장소를 사용하여 토큰을 관리합니다:

- `tempKeyStore` - 발급받은 토큰 정보를 임시로 저장합니다. 여기에는 모의투자와 실전 토큰이 모두 포함됩니다.
- `keyStore` - 현재 사용 중인 계정 타입(모의투자/실전) 정보를 저장합니다.

토큰은 브라우저 세션 동안만 유효하며, 페이지를 새로고침하거나 브라우저를 닫으면 토큰이 소멸됩니다.

### 주의사항

- API 호출 전에 항상 `발급된토큰확인()` 메서드를 호출하여 토큰이 유효한지 확인하는 것이 좋습니다.
- 토큰 발급에 실패할 경우 API 호출이 불가능하므로 적절한 오류 처리가 필요합니다.
- 모의투자와 실전 계정은 별도의 토큰을 사용하므로, 계정 전환 시 해당 계정에 맞는 토큰을 사용해야 합니다.
- 토큰의 유효 기간은 일반적으로 24시간이지만, API 제공자 정책에 따라 변경될 수 있습니다.

## 인공지능 기능 (useAi 훅)

PotatoInvest 애플리케이션에서는 주식 시장 예측 및 분석을 위한 인공지능 기능을 `useAi` 커스텀 훅을 통해 제공합니다. 이 훅은 TensorFlow.js를 기반으로 하여 주식 데이터의 패턴을 분석하고 미래 가격 변동을 예측합니다.

### useAi 훅 기본 사용법

```javascript
import useAi from "@/hooks/useAi";

function PredictionComponent() {
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi();

  const handlePrediction = async () => {
    try {
      // 주식 데이터 가져오기
      const stockData = await 데이터가져오기();

      // 데이터 전처리
      const processedData = 전처리(stockData);

      // 모델 불러오기 및 가중치 설정
      const model = await 역직렬화(modelJson, weightsJson);

      // 예측 수행
      const predictions = await 예측(model, processedData);

      // 예측 결과 처리
      console.log("예측 결과:", predictions);
    } catch (error) {
      console.error("예측 과정에서 오류 발생:", error);
    }
  };
}
```

### useAi에서 제공하는 주요 메서드

- `데이터가져오기()` - API를 통해 주식 데이터를 가져옵니다.

  - 반환값: `Promise<Array>` - 주식 데이터 배열

- `전처리(data)` - 원시 주식 데이터를 AI 모델이 처리할 수 있는 형태로 변환합니다.

  - 매개변수: `data` - 원시 주식 데이터
  - 반환값: `Object` - 전처리된 특징(feature) 데이터

- `역직렬화(modelJson, weightsJson)` - 저장된 모델 구조와 가중치를 불러와 작동하는 TensorFlow 모델로 변환합니다.

  - 매개변수:
    - `modelJson` - 모델 구조를 담은 JSON 객체
    - `weightsJson` - 모델 가중치를 담은 JSON 객체
  - 반환값: `tf.LayersModel` - 사용 가능한 TensorFlow 모델

- `예측(model, data)` - 학습된 모델을 사용하여 주식 가격 변동을 예측합니다.
  - 매개변수:
    - `model` - TensorFlow 모델 인스턴스
    - `data` - 전처리된 입력 데이터
  - 반환값: `Promise<Array>` - 예측 결과 배열

### AI 모델 작동 방식

PotatoInvest의 AI 모델은 다음과 같은 방식으로 주식 시장 예측을 수행합니다:

1. **데이터 수집**: 과거 주가 데이터, 거래량, 기술적 지표 등을 수집합니다.
2. **데이터 전처리**: 수집된 데이터를 정규화하고, 시계열 특성을 고려하여 구조화합니다.
3. **모델 학습**: 전처리된 데이터를 사용하여 딥러닝 모델(LSTM, GRU 등)을 학습시킵니다.
4. **예측 수행**: 학습된 모델을 사용하여 미래 주가 변동을 예측합니다.
5. **결과 해석**: 예측 결과를 사용하여 매수/매도 신호를 생성합니다.

### AI 예측 결과 활용

예측 결과는 상승/하락 확률과 예상 변동률을 포함하며, 이 정보는 다음과 같이 활용할 수 있습니다:

- 종목별 매수/매도 시점 결정
- 포트폴리오 리밸런싱
- 위험 관리 전략 수립

### 주의사항

- AI 예측은 100% 정확하지 않으며, 참고용으로만 사용해야 합니다.
- 시장 상황, 예상치 못한 이벤트, 감정적 요인 등은 AI 모델이 고려하지 못할 수 있습니다.
- 실제 투자 결정은 AI 예측과 함께 다양한 요소를 종합적으로 고려하여 이루어져야 합니다.
- AI 모델은 정기적으로 새로운 데이터로 재학습되어야 정확도를 유지할 수 있습니다.

## 주식 시세 조회 (useQuotations 훅)

PotatoInvest 애플리케이션에서는 주식 시세 및 상세 정보 조회를 간편하게 할 수 있도록 `useQuotations` 커스텀 훅을 제공합니다. 이 훅은 한국투자증권 API를 사용하여 해외주식의 시세 정보를 조회하는 기능을 제공합니다.

### useQuotations 훅 기본 사용법

```javascript
import useQuotations from "@/hooks/useQuotations";

function StockInfoComponent() {
  const { 조건검색, 현재가상세, 기간별시세 } = useQuotations();

  const handleFetchStockInfo = async (종목코드) => {
    try {
      // 종목 상세 정보 조회
      const detailInfo = await 현재가상세(종목코드);

      // 일봉 데이터 조회
      const dailyPrices = await 기간별시세({
        종목코드: 종목코드,
        구분: "0",
        수정주가반영여부: "0",
      });

      // 데이터 활용
      console.log("종목 상세:", detailInfo);
      console.log("일봉 데이터:", dailyPrices);
    } catch (error) {
      console.error("시세 정보 조회 실패:", error);
    }
  };
}
```

### useQuotations에서 제공하는 주요 메서드

- `조건검색(종목코드)` - 나스닥 시장에서 특정 종목코드에 대한 기본 정보를 조회합니다.

  - 매개변수: `종목코드` - 조회할 종목의 코드 (예: "AAPL")
  - 반환값: `Promise<Object>` - 조회된 종목 정보 객체

- `현재가상세(종목코드)` - 해외주식 현재가 상세 정보를 조회합니다.

  - 매개변수: `종목코드` - 조회할 종목의 코드
  - 반환값: `Promise<Object>` - 해당 종목의 현재가 및 상세 정보

- `기간별시세({ 종목코드, 구분, 수정주가반영여부 })` - 특정 종목의 기간별 시세 데이터를 조회합니다.
  - 매개변수:
    - `종목코드` - 조회할 종목의 코드
    - `구분` - 시세 조회 구분 (예: "0" - 일봉, "1" - 주봉, "2" - 월봉)
    - `수정주가반영여부` - 수정주가 반영 여부 (예: "0" - 미반영, "1" - 반영)
  - 반환값: `Promise<Array>` - 해당 종목의 기간별 시세 데이터 배열

### 시세 데이터 구조

#### 현재가상세 응답 구조

현재가상세 API는 다음과 같은 정보를 포함합니다:

- 현재가 (last): 종목의 최신 거래 가격
- 전일대비 (t_xdif): 전일 종가 대비 변동 금액
- 등락률 (t_xrat): 전일 종가 대비 변동 비율(%)
- 시가 (open): 당일 첫 거래 가격
- 고가 (high): 당일 가장 높았던 가격
- 저가 (low): 당일 가장 낮았던 가격
- 거래량 (pvol): 당일 총 거래량
- 거래대금 (pamt): 당일 총 거래대금
- 52주 최고/최저가 (h52p/l52p): 52주 동안의 최고/최저 가격
- PER (perx): 주가수익비율
- PBR (pbrx): 주가순자산비율
- EPS (epsx): 주당순이익
- BPS (bpsx): 주당순자산
- 시가총액 (mcap): 총 시가총액
- 상장주식수 (shar): 유통 주식 수

#### 기간별시세 응답 구조

기간별시세 API는 다음과 같은 정보를 포함하는 배열을 반환합니다:

- 일자 (xymd): 해당 데이터의 날짜
- 시가 (open): 해당 기간의 첫 거래 가격
- 고가 (high): 해당 기간의 최고가
- 저가 (low): 해당 기간의 최저가
- 종가 (clos): 해당 기간의 마지막 거래 가격
- 거래량 (pvol): 해당 기간의 총 거래량
- 거래대금 (pamt): 해당 기간의 총 거래대금
- 수정구분 (mdvl): 수정주가 구분 코드
- 수정비율 (xrat): 수정주가 적용 비율

### 주의사항

- 시세 정보 조회 전에 유효한 인증 토큰이 필요합니다. `useToken` 훅을 통해 토큰이 유효한지 확인하는 것이 좋습니다.
- 종목코드는 대소문자를 구분합니다 (예: "AAPL", "MSFT").
- 시세 데이터는 실시간이 아닌 일정 간격으로 갱신되므로, 주문 시 최신 정보인지 확인해야 합니다.
- 대량의 시세 데이터 요청은 API 호출 제한에 걸릴 수 있으므로, 적절한 간격을 두고 호출하는 것이 좋습니다.
- 해외 거래소 휴장일에는 데이터가 업데이트되지 않을 수 있습니다.
