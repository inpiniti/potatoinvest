# PotatoInvest

## useApi 훅 사용 방법

PotatoInvest 애플리케이션에서는 한국투자증권 API 호출을 간소화하기 위해 `useApi` 커스텀 훅을 제공합니다. 이 훅을 사용하면 인증 처리, 에러 핸들링, 토큰 관리 등이 자동으로 처리됩니다.

### useApi 훅 기본 사용법

```javascript
import useApi from '@/hooks/useApi';

function MyComponent() {
  const api = useApi();

  const handleFetchData = async () => {
    try {
      // 토큰 발급
      const tokenResponse = await api.oauth2.tokenP();

      // 현재가 조회
      const priceData = await api.quotations.price({
        excd: 'NAS',
        symb: 'AAPL',
      });

      // 주문 실행
      const orderResult = await api.trading.order({
        // 주문 관련 파라미터
      });
    } catch (error) {
      console.error('API 호출 실패:', error);
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
import useToken from '@/hooks/useToken';

function MyComponent() {
  const { 발급된토큰확인, 토큰발급, 토큰남은시간확인 } = useToken();

  const handleAuth = async () => {
    // 토큰이 이미 발급되어 있는지 확인
    const isTokenValid = await 발급된토큰확인();

    if (!isTokenValid) {
      // 유효한 토큰이 없으면 새로 발급
      const success = await 토큰발급();
      if (!success) {
        console.error('토큰 발급 실패');
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
import useAi from '@/hooks/useAi';

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
      console.log('예측 결과:', predictions);
    } catch (error) {
      console.error('예측 과정에서 오류 발생:', error);
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
import useQuotations from '@/hooks/useQuotations';

function StockInfoComponent() {
  const { 조건검색, 현재가상세, 기간별시세 } = useQuotations();

  const handleFetchStockInfo = async (종목코드) => {
    try {
      // 종목 상세 정보 조회
      const detailInfo = await 현재가상세(종목코드);

      // 일봉 데이터 조회
      const dailyPrices = await 기간별시세({
        종목코드: 종목코드,
        구분: '0',
        수정주가반영여부: '0',
      });

      // 데이터 활용
      console.log('종목 상세:', detailInfo);
      console.log('일봉 데이터:', dailyPrices);
    } catch (error) {
      console.error('시세 정보 조회 실패:', error);
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

## Studio 워크스페이스 (/studio)

Google AI Studio 레이아웃을 참고한 내부 투자 분석/실험용 화면. 1개의 Page와 10개의 전용 컴포넌트로 구성되어 다중 뷰/설정 패널/내비게이션을 통합 제공합니다.

### 구성 요소 개요

Page (app/studio/page.jsx)

- 전체 레이아웃 조립: 좌측 SidebarLeft, 우측 SidebarRight, 중앙 컨텐츠(Inset) + 상단 헤더(Breadcrumb, SidebarTrigger)

컴포넌트 (10)

1. `components/sidebar-left.tsx` (SidebarLeft)

- 좌측 내비게이션 컨테이너. TeamSwitcher, NavMain, NavSecondary, NavFavorites, NavWorkspaces 등을 포함하도록 확장 예정.

2. `components/sidebar-right.tsx` (SidebarRight)

- 우측 설정/보조 패널. 사용자 정보(NavUser), DatePicker, Calendars, 추가 액션(New Calendar) 제공.

3. `components/team-switcher.tsx` (TeamSwitcher)

- 팀 전환 드롭다운. 활성 팀 표시, 목록/단축키, 팀 추가 placeholder.

4. `components/nav-main.tsx` (NavMain)

- 1차 주요 메뉴 목록 (아이콘 + 제목, 활성 상태 isActive prop).

5. `components/nav-secondary.tsx` (NavSecondary)

- 보조 메뉴 그룹. 배지(SidebarMenuBadge) 지원.

6. `components/nav-favorites.tsx` (NavFavorites)

- 즐겨찾기 목록 + 항목별 컨텍스트 메뉴(Remove, Copy Link 등) + More 항목.

7. `components/nav-workspaces.tsx` (NavWorkspaces)

- 워크스페이스별 Collapsible + 하위 페이지(Sub) 구조, 펼침/추가 액션.

8. `components/nav-user.tsx` (NavUser)

### Dataroma Portfolio Detail (/studio/portfolio/[name])

Studio Home (`/studio/home`)의 "Based on Person" 탭에서 특정 로우를 클릭하면 해당 투자자 상세 포트폴리오 페이지로 이동합니다.

경로: `/studio/portfolio/{name}` (URL 인코딩된 이름)

구성:

1. 상단 헤더: 투자자 이름, 총 포트폴리오 가치(totalValue)
2. 파이 차트: 상위 12개 비중 + 나머지 합산 Other (shadcn + recharts PieChart, `ChartContainer` 활용)
3. 하단 테이블: 전체 보유 종목 코드와 비중(ratio)

데이터 소스:

- API: `GET /api/dataroma/person?name=...`
  - 응답: `{ name, totalValue, portfolio: [{ code, ratio }] }`
  - 내부적으로 `generateDataromaBase`를 lookup 기반 호출 후 가장 일치하는 투자자 선택.

차트 색상:

- `--chart-1`~`--chart-12` 커스텀 CSS 변수 순환, 초과분은 Other로 묶음.

캐싱:

- person API는 `no-store` 헤더 (실시간/반복 탐색 고려). 페이지 단에서 React Query 1시간(`staleTime`) 캐시.

확장 아이디어:

- 비중 슬라이더 리밸런싱 시뮬레이터
- 종목 클릭 → 시세/세부 정보 드로어
- Recommended 포트폴리오 비교 오버레이

  - 사용자 아바타/계정 메뉴(Upgrade, Account, Billing, Notifications, Logout 등) 드롭다운.

9. `components/calendars.tsx` (Calendars)

- 다중 카테고리 캘린더 그룹(접기/펼치기), 항목 선택 상태(체크 아이콘) 표시.

10. `components/date-picker.tsx` (DatePicker)

- 단일 월 달력(Calendar) 컴포넌트(선택 스타일을 sidebar-primary 토큰에 맞춤).

### 레이아웃 및 토큰 사용

- 좌측 사이드바: `--sidebar`, `--sidebar-accent`, `--sidebar-primary` 계열 색상.
- 우측 패널: `--panel`, `--surface-*`, 경계선 `--border`.
- 드롭다운 / Popover: `--popover`, `--popover-foreground`, focus에 `--ring`.
- 상단 헤더: `--background`, 경계선/분리자 `--border`.
- 아이콘/상태 강조: `--accent`, `--primary` (활성/선택), 체크박스 유사 표시에는 border 대비.

### 상태 & 접근성

- Radix UI 기반: Dropdown / Collapsible / Menu State (data-[state=open]) 활용.
- NavFavorites / Workspaces 항목 hover 시 액션 버튼 노출(showOnHover prop).
- 키보드 내비게이션: Radix 포커스 관리, 추후 focus-visible 링 강화 예정.

### 앞으로 추가 예정 (로드맵)

- 중앙 컨텐츠 실제 뷰 매핑 (포트폴리오 설정, 지표 대시보드, 종목 상세 등)
- URL 쿼리 또는 segment 라우팅으로 뷰 상태 동기화
- Zustand/React Query 연동하여 우측 패널 설정/날짜 선택 상태 보존
- 다크 모드 토글 + prefers-color-scheme 감지
- 접근성 검사(aXe) 및 시각 회귀(Playwright) 테스트
- Team 추가 플로우 모달 구현
- Workspace & Favorites 동적 CRUD (서버/스토어 연동)

### 사용 방법 (현재)

개발 서버 실행 후 `/studio` 경로 접속 → 좌/우 패널 및 드롭다운/Collapsible 상호작용으로 테마/레이어 구조 확인. 중앙 박스는 추후 실제 기능으로 대체.

### 참고

구글 AI Studio의 3-패널 구조/중립 톤과 내부 OKLCH 기반 토큰 세트를 결합하여 일관된 색상/간격 실험 목적. 기능 로직은 본 프로젝트 요구에 따라 점진 확장.

### 인증 / 로그아웃 (Studio 우측 패널)

우측 패널 상단 계정 영역은 로그인 상태와 로그아웃 상태에 따라 다른 컴포넌트를 렌더링합니다.

구성:

- 로그인 상태: `NavUser` (아바타, 계정 드롭다운, Log out 메뉴)
- 로그아웃 상태: `NavAuthLoggedOut` (로그인 버튼 + Dialog)

상태 전환 흐름:

1. 초기(auth.loggedIn=true 가정) → `NavUser` 표시
2. 드롭다운에서 Log out 선택 → 상태 `{ loggedIn:false }` 로 전환 → `NavAuthLoggedOut` 표시
3. 로그아웃 UI에서 로그인 버튼 클릭 → Dialog 열림 (아이디/비밀번호 입력)
4. 로그인 폼 제출(onLogin) → 검증 후 `{ loggedIn:true, user }` 저장 → `NavUser` 재표시

파일:

- `components/nav-user.tsx` : onLogout prop 추가, Log out 클릭 시 호출
- `components/nav-auth-logged-out.tsx` : Dialog 기반 로그인 폼 (아이디, 비밀번호, 취소, 로그인 버튼)
- `components/sidebar-right.tsx` : `useState` 로 auth 상태 관리 및 조건부 렌더링

Dialog 세부:

- Radix Dialog 래퍼(`ui/dialog.tsx`) 사용
- 폼 요소는 기본 input + focus ring(`focus:ring-2`)과 surface 토큰(`bg-surface-inset`, `border`) 적용
- 제출 중 비활성화 문구(로그인 중...) 처리 (간단한 UX 표시)

추후 확장 아이디어:

- 실제 인증 API 연동 (`onLogin` 비동기 검증 / 에러 메시지)
- 비밀번호 찾기 / 회원가입 링크
- 소셜 로그인 버튼(예: OAuth) 추가
- 토큰 저장 시 보안 고려(HTTPOnly 쿠키 or secure storage)
- 전역 auth store(Zustand) 추출 및 다중 탭 동기화

간단 API 계약(현재 임시):

- onLogin({ id, password }): Promise<void> | void (빈 문자열이면 거부 / TODO 위치)
- onLogout(): void (store reset)

접근성:

- Dialog: ARIA Title/Description (`DialogTitle`, `DialogDescription`)
- 폼 label-for 연결 (id="login-id" / id="login-pw")

### Kakao 소셜 로그인 (Supabase OAuth) 추가

구현 상태:

- `components/nav-auth-logged-out.tsx` 에 카카오 로그인 버튼 추가 (Supabase OAuth 호출)
- 이메일/비밀번호 폼은 UI 상 노출되지만 비활성화(opacity, pointer-events none)되어 현재 사용 불가
- Supabase 세션 변화는 `components/sidebar-right.tsx` 에서 `supabase.auth.onAuthStateChange` 로 감지하여 우측 패널 사용자 상태 갱신
- 로그아웃 시 Supabase `signOut()` 호출 후 상태 초기화

필요 환경 변수 (.env.local):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

임시 placeholder 값은 `lib/supabaseClient.ts` 내부에서 사용 중 (실 서비스 이전 반드시 교체).

Supabase 설정 절차:

1. Supabase 프로젝트 생성 (이미 있다면 생략)
2. Dashboard > Authentication > Providers 이동
3. Kakao Provider 활성화
4. Kakao Developers 콘솔에서 앱 생성 후 다음 값 확보:

- REST API 키 (Client ID)
- Client Secret (필요 시)
- Redirect URI: `https://<your-project>.supabase.co/auth/v1/callback` 와 로컬 개발용 `http://localhost:3000` (Supabase 기본 OAuth callback 경로 활용)

5. Supabase Kakao Provider 설정 화면에 REST API 키/Secret 입력 및 Redirect URL 등록
6. (선택) 로컬 개발용 Redirect URI 를 Kakao Dev 콘솔에도 추가 등록
7. Supabase Settings > API 에서 Project URL / anon key 복사 → `.env.local` 반영 후 dev 서버 재시작

동작 흐름:

1. 사용자 `카카오로 로그인` 버튼 클릭
2. `supabase.auth.signInWithOAuth({ provider: 'kakao', redirectTo: <origin>/studio/home })` 실행 (이 기본 경로는 `NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT` 환경 변수로 재정의 가능)
3. Kakao 인증 → Supabase callback → 세션 저장
4. 복귀 후 `sidebar-right.tsx` 의 `getSession` & `onAuthStateChange` 로 세션 감지 → `NavUser` 렌더
5. Log out 시 `supabase.auth.signOut()` → 상태 초기화

사용자 메타데이터:

- Kakao 프로필 이미지/닉네임은 `session.user.user_metadata.avatar_url`, `name` 등에 제공될 수 있으며 없을 경우 기본 아바타로 대체.

추가 예정:

- 이메일 로그인 활성화 및 서버 검증
- 오류 토스트(sonner) 연동 및 로딩 표시
- 전역 Zustand store 로 auth 상태 추출 & 다중 탭 sync
- Access token 갱신/만료 처리

보안 메모:

- Supabase anon key 는 public 가능하나 RLS 정책으로 DB 접근 제한 필요
- Kakao Client Secret 은 서버/환경변수로만 관리 (코드 커밋 금지)

테스트 체크리스트:

- 환경 변수 설정 후 dev: `/studio` → 로그인 → Kakao → redirect → 사용자 표시
- 새 탭 열어도 세션 유지 여부 확인
- Log out 후 즉시 NavAuthLoggedOut 로 전환 확인
- `NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT` 변경 후 dev 재시작 → 해당 경로로 이동 확인

환경 변수(추가):

```env
# Kakao 로그인 성공 후 이동 (절대 URL 또는 / 로 시작). 미설정 시 /studio/home
NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT=/studio/home
```

구현 세부:

- `components/nav-auth-logged-out.tsx` 에서 `process.env.NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT` 값을 읽어 redirectTo 구성
- 값이 `http` 로 시작하지 않으면 `window.location.origin + 값` 으로 절대 경로화
- 미설정 또는 빈 문자열이면 기본 `/studio/home`

HOTFIX 기록:

- 초기 Kakao 버튼 통합 중 JSX 구조 손상 → `nav-auth-logged-out.tsx` 재작성 및 lint 통과

### 계좌 관리 (Accounts Section)

구현 상태:

- `components/accounts-section.tsx` : 로그인 섹션 아래 "계좌" 헤더 + + 버튼 + 계좌 목록 (닉네임 / 생성일 / 삭제 / 계좌번호)
- - 버튼 클릭 → Dialog (계좌 / 닉네임 / 키 / 비밀키) 입력 후 저장
- 저장 시 `/api/accounts` POST (서버) 로 Supabase access_token Bearer 전달 → 서버에서 service role 로 사용자 검증 후 `public.brokerage_accounts` 테이블에 삽입
- 목록은 `/api/accounts` GET (fields: id, account_number, alias, created_at)
- 항목 우측 × 클릭 시 `/api/accounts` DELETE (body: { id }) 로 삭제

API 경로:

- GET /api/accounts → { accounts: [{ id, account_number, alias, created_at }] }
- POST /api/accounts body: { accountNumber, apiKey, apiSecret, alias? }
- DELETE /api/accounts body: { id }
- POST /api/accounts/login body: { id } → { accountId, access_token, token_type, expires_in, access_token_token_expired }

보안 처리:

- 클라이언트는 Supabase access_token 만 전송 (Kakao 원본 토큰 X)
- 서버(route handler)에서 `admin.auth.getUser(token)` 으로 유효성 검증
- 비밀키: SHA-256 해시(`secret_key_hash`) + AES-256-GCM 암호문(`secret_key_enc`) 모두 저장 → 해시는 탐지/중복, 암호문은 토큰 발급 시 복호화
- 암호화 키: 환경 변수 `ACCOUNT_SECRET_ENC_KEY` (32바이트 raw/hex/base64) 로 초기화
- service role key 는 `.env.local` 의 `SUPABASE_SERVICE_ROLE_KEY` (절대 클라이언트 번들에 포함 금지)

테이블 스키마(SQL): `sql/brokerage_accounts.sql` (요약)

```
create table public.brokerage_accounts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  account_no text not null,
  api_key text not null,
  secret_key_hash text not null,
  secret_key_enc text null,
  alias text null,
  created_at timestamptz default now(),
  unique(user_id, account_no)
);
```

RLS 정책은 사용자 자신의 행만 CRUD 가능하도록 구성.

환경 변수 (.env.local 예시):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # server only
```

프론트 흐름:

1. 세션 확보: `supabase.auth.getSession()`
2. Bearer 토큰 포함 fetch (GET/POST/DELETE/LOGIN)
3. 저장 성공 → Dialog 닫고 필드 초기화 → 목록 재로드
4. 삭제 → confirm 후 DELETE → 목록 재로드
5. 로그인 아이콘 클릭 → /api/accounts/login → 토큰 수신 → zustand 저장 → 체크 아이콘

추가 예정:

- 계좌 수정(닉네임 변경 / 키 회전)
- 키 회전(재발급) 및 secret 재암호화
- 만료 임박 토큰 자동 갱신 / background refresh
- 서버 로깅 및 감사 추적
- activeAccountId 삭제 시 처리

주의:

- ACCOUNT_SECRET_ENC_KEY 없으면 secret_key_enc 저장 실패(해시만 저장) → /api/accounts/login 복호화 불가
- 암호화 키 분실 시 복호화 불가 (재등록 필요)
- 운영/개발 키 분리, 회전 시 재암호화 작업 필요

환경 변수 추가:

```
ACCOUNT_SECRET_ENC_KEY=your-32-byte-key
```

토큰 저장 (zustand `accountTokenStore`):

```
{
  activeAccountId: number|null,
  tokens: {
    [accountId]: {
      accountId,
      access_token,
      token_type,
      expires_in,
      access_token_token_expired,
      fetched_at
    }
  }
}
```

### 토큰 섹션 (Token Section)

`/studio` 우측 패널에서 계좌 섹션 바로 아래에 활성(로그인 성공) 계좌의 토큰 정보를 한 줄로 요약 표시하는 `TokenSection` 을 추가했습니다.

구현:

- 파일: `components/token-section.tsx`
- 사이드바 통합: `components/sidebar-right.tsx` 내부 `AccountsSection` 아래 `<TokenSection />` 렌더
- 상태: `store/accountTokenStore` 의 `activeAccountId` 및 `tokens[activeAccountId]` 사용

표시 내용:

- 계좌 ID (`#<id>`) 와 남은 만료 시간(초 → 시간 단위 변환, `expires_in` 존재 시)
- `access_token` 전체 문자열을 monospace 한 줄로 출력 (CSS: `overflow-hidden text-ellipsis whitespace-nowrap`) → 화면에는 앞부분만 보이고 나머지는 `...`
- 전체 토큰은 요소 hover 시 title tooltip 으로만 확인 가능 (우발적 노출 최소화)
- 토큰 없으면 ShieldOff 아이콘 + "로그인된 계좌 없음" 메시지
- 토큰 있으면 ShieldCheck 아이콘

보안 고려:

- 토큰 전문이 UI에 그대로 길게 노출되지 않음 (시각적 shoulder surfing 감소)
- Copy 기능 미구현 (원치 않는 유출 방지). 필요 시 명시적 버튼 + 추가 확인절차로 추후 확장 가능

추가 개선 아이디어:

- 만료 임박(예: < 10분) 시 배경 색상 경고
- 자동 새로고침/재발급 버튼
- 다중 계좌 동시 토큰 목록 (현재는 active 계좌만)

관련 변경 사항:

- README 본 섹션 추가
- `sidebar-right.tsx` 에 `<TokenSection />` 삽입
- 신규 컴포넌트 `token-section.tsx` 생성

### 계좌 잔고 요약 (Account Balance Section)

한국투자 `inquire-present-balance` API 의 `output2`(통화별) / `output3`(총계) 를 이용해 활성 계좌의 핵심 지표를 `/studio` 우측 패널 토큰 섹션 아래 요약 표시하는 컴포넌트 추가.

구현:

- 훅: `hooks/usePresentBalance.ts` (`@tanstack/react-query` 사용)
  - queryKey: `['presentBalance', activeAccountId, token, params]`
  - 5분 간격 자동 재조회(`refetchInterval`)
  - 성공(rt_cd==='0') 아닌 경우 오류 throw
- 컴포넌트: `components/account-balance-section.tsx`
  - 총자산, 총예수금, 평가금액, 평가손익, 수익률, 출금가능, 외화평가총액, 미결제매수 등 `output3` 주요 필드 그리드 표시
  - `output2` 통화별 예수/잔고 관련 금액을 스크롤 가능한 리스트로 표시 (현재 `frcr_dncl_amt_2` 중심)
  - 활성 계좌 없으면 빨간 안내, 로딩/에러/데이터 없음 상태 처리
- 사이드바 통합: `sidebar-right.tsx` 에 `<AccountBalanceSection />` 추가 (TokenSection 아래)

API 개선:

- 새로운 백엔드 라우트 `POST /api/accounts/presentBalance` 추가: 클라이언트는 더 이상 암호화 키/앱키를 직접 전달하지 않고, `accountId`, `kiAccessToken`(한국투자 발급 토큰), 선택 파라미터만 전송.
- 서버가 Supabase 서비스 롤로 해당 계좌의 `api_key` + 암호화된 `secret_key_enc` 복호화 후 한국투자 `inquire-present-balance` 호출.

요청 바디 예시:

```json
{
  "accountId": 123,
  "kiAccessToken": "<KI_ACCESS_TOKEN>",
  "isVts": true
}
```

선택 필드(CANO 등)를 지정하지 않으면 서버가 계좌 DB 값 또는 기본값(ACNT_PRDT_CD=01 등)을 채움.

응답 구조 (원문 요약):

- rt_cd, msg_cd, msg1
- output1: 체결기준 종목별 잔고 배열 (주요 필드: prdt_name, cblc_qty13, ord_psbl_qty1, frcr_pchs_amt, frcr_evlu_amt2, evlu_pfls_amt2, evlu_pfls_rt1, pdno, avg_unpr3, ovrs_now_pric1 등)
- output2: 통화별 합계 (crcy_cd, frcr_dncl_amt_2 외 다수)
- output3: 총계 (tot_asst_amt, evlu_amt_smtl, evlu_pfls_amt_smtl, evlu_erng_rt1, wdrw_psbl_tot_amt 등)

클라이언트 변경:

- `AccountBalanceSection` props 단순화(계좌 ID/토큰 내부 조회) → 보안 표면 축소.
- `usePresentBalance` 훅이 새 라우트 사용.

확장 아이디어:

- output2 금액 컬럼 다중(매수합계/예수금 등) 토글
- 통화 환율 적용 원화 환산 추가
- 리프레시 버튼 스켈레톤/회전 아이콘 개선
- 에러 재시도 버튼 & toast 연동

React Query 캐싱 질문:

- 동일 queryKey 로 다른 섹션에서 `usePresentBalance` 호출하면 캐시 공유 → 네트워크 재요청 없이 상태 동기화 가능 (staleTime 내)
- 파라미터/activeAccountId/토큰이 바뀌면 key 변경되어 새 조회 수행

업데이트 (즉시 조회 & UX 개선):

- 계좌 토큰 발급(로그인) 직후 5분 주기 대기 없이 바로 현재 잔고를 조회하도록 `accounts-section.tsx` 에서 `account-token-issued` CustomEvent 를 디스패치하고, `AccountBalanceSection` 이 이를 수신해 즉시 `refetch()` 수행.
- 새로고침 버튼 아이콘이 요청 중일 때 회전(`animate-spin`), 하단 상태 메시지에 `갱신 중...` 표시 추가.
- `usePresentBalance` 훅은 `refetchOnMount: true`, `refetchOnReconnect: true` 로 초기 진입 시 즉시 1회 호출하도록 조정.
- (추가 아이디어 반영) 토큰 로그인 후 첫 조회 실패 시에도 사용자가 바로 재시도 가능 (에러 메시지 유지 + 새로고침 버튼).

확장 아이디어 구현 현황:

- [x] 토큰 발급 직후 즉시 조회
- [x] 수동 새로고침 시 로딩 회전 아이콘/상태 메시지
- [ ] 금액 포맷팅(천단위, 통화기호)
- [ ] 평가손익 색상(양수/음수) 강조
- [ ] output2 다중 필드 토글 & 환산표시
- [ ] 주문/체결 이벤트 후 캐시 무효화 유틸 (invalidatePresentBalanceCache) 활용 예시 문서화

#### (UPDATED) KRW / USD 통화 탭 전환 (서버 고정 + 클라이언트 환산 하이브리드)

요구 변경에 따라 present balance API 호출은 기본 파라미터 `WCRC_FRCR_DVSN_CD=02`(프로젝트 기준: 원화) 로 고정하고, 탭 전환 시 **서버 재조회 없이** USD 탭에서만 클라이언트 환율(`/api/exchangeRate`) 을 적용해 금액을 달러로 환산 표시하는 하이브리드 방식으로 수정했습니다.

현재 동작:

- 서버: 항상 02 로 조회 (일관된 KRW 기준 총계 확보)
- 탭: KRW → 원본 그대로, USD → KRW 금액 ÷ usdToKrw (소수 둘째 반올림) 표시
- React Query: 환율은 별도 키 `usd-krw-rate` 로 1시간 stale 캐시
- Re-fetch 버튼: 잔고만 재조회 (환율은 그대로, 필요 시 새로고침 후 자동 만료되면 갱신)

대상 필드 (환산 적용):
`tot_asst_amt`, `tot_dncl_amt`, `evlu_amt_smtl`, `evlu_pfls_amt_smtl`, `wdrw_psbl_tot_amt`, `frcr_evlu_tota`, `ustl_buy_amt_smtl`

장점:

- 서버 파라미터 변동 없이 안정적 캐싱 (queryKey 간소화)
- USD 표시 전환 즉시/무지연 (네트워크 왕복 없음)
- 환율 API 장애 시 KRW 표시 영향 없음 (USD 탭만 '-')

주의 / 한계:

- 실제 KI API 가 USD 코드(01) 로 제공하는 외화기준 세부 값과 차이가 있을 수 있음 (환산 오차, 반올림). 필요 시 다시 서버 재조회 모드로 토글 가능하도록 옵션화 예정.
- 서버 기본값 02 의미(원화 vs 외화)는 내부 규칙에 맞게 주석 유지; 외부 문서 공유 시 KI 공식 스펙 표기를 재확인 권장.

향후 개선 아이디어:

- 설정에서 "서버 USD 재조회" 모드 선택 → 탭 전환 시 params 변경 & refetch
- 환율 timestamp / 갱신 버튼 표시
- KRW↔USD 동시 2열 비교 레이아웃

프로그래매틱 무효화:

```ts
// 주문 체결 후 등 비동기 사이드이펙트 지점에서 호출 가능
import { invalidatePresentBalanceCache } from '@/hooks/usePresentBalance';
invalidatePresentBalanceCache();
```

### 계좌 암호화 문제 해결 (Secret not stored encrypted)

계좌 추가 후 `/api/accounts/login` 호출 시 `Secret not stored encrypted` 오류가 발생한다면 암호화 키 설정 문제일 가능성이 높습니다.

체크리스트:

1. `.env.local` 에 `ACCOUNT_SECRET_ENC_KEY` 가 설정되어 있는지 확인
2. 값이 다음 중 하나의 형식을 만족하는지 확인

- 32바이트 ASCII (예: `12345678901234567890123456789012`)
- 64자 hex (예: `a3f4...` 64글자)
- base64 로 인코딩된 32바이트 (길이 43~44 포함 `=` 패딩)

3. 서버 재시작 (키는 빌드 타임 로드되므로 dev 서버를 다시 실행해야 함)
4. 기존에 암호화 없이 저장된 계좌는 복호화할 수 없으니 삭제 후 다시 등록

로컬에서 빠른 확인 방법 (Windows PowerShell):

```powershell
$raw = [Text.Encoding]::UTF8.GetBytes('12345678901234567890123456789012'); $raw.Length  # 32 인지 확인
```

Base64 키 생성 예시:

```powershell
[Convert]::ToBase64String((New-Object byte[] 32 | ForEach-Object {$_ = Get-Random -Minimum 0 -Maximum 256; $_}))
```

오류 원인별 대응:

- `Missing ACCOUNT_SECRET_ENC_KEY`: 환경변수 누락 → `.env.local` 추가 후 서버 재시작
- `ACCOUNT_SECRET_ENC_KEY must be 32-byte`: 형식 불일치 → 규격 맞춰 재생성
- 계좌 추가 시 서버 응답: `Encryption key missing or invalid...` → 위 1~3 단계 수행 후 재시도
- 로그인 시 `Secret not stored encrypted`: 해당 레코드에 `secret_key_enc` 가 NULL → 계좌 삭제 후 재등록 (키 정상 설정 후)

보안 권장:

- 운영 환경에서는 .env 파일 대신 안전한 Secret 관리 (예: Vercel Project Secrets, Vault)
- 키 회전 필요 시: (1) 새 키 주입 (2) 기존 레코드 순회 복호화/재암호화 마이그레이션 스크립트 실행 (3) 구 키 폐기

## Dataroma Base 집계 API & Studio UI

슈퍼 투자자(“gurus”)들의 포트폴리오를 스크래핑 후 구조화한 기본 집계(base) 데이터를 제공하는 API 및 Studio 홈 탭 UI를 추가했습니다.

### 1. API: `GET /api/dataroma/base`

Query Parameters (optional):

- `lookup`: 특정 투자자 식별자/이름 일부로 필터링

Response 예시 (2025-09 업데이트: person 포트폴리오/stock 투자자 상세 확장 + 서버 캐시):

```json
{
  "based_on_person": [
    {
      "no": 1,
      "name": "Warren Buffett - Berkshire Hathaway",
      "totalValue": "$257,521,771,000",
      "totalValueNum": 257521771000,
      "portfolio": [
        { "code": "AAPL", "ratio": "22.31%" },
        { "code": "AXP", "ratio": "8.45%" }
      ]
    }
  ],
  "based_on_stock": [
    {
      "stock": "AAPL",
      "person": [
        {
          "no": 15,
          "name": "Duan Yongping - H&H International Investment",
          "ratio": "62.47%"
        },
        {
          "no": 1,
          "name": "Warren Buffett - Berkshire Hathaway",
          "ratio": "22.31%"
        }
      ],
      "person_count": 20,
      "avg_ratio": "5.69%",
      "sum_ratio": "113.77%"
    }
  ],
  "meta": { "investors_count": 80, "generated_at": "2025-09-03T00:00:00.000Z" }
}
```

설명 (갱신 후):

- `based_on_person`: 이제 각 투자자 별 `portfolio` 전체 보유 목록과 `totalValueNum` (숫자형) 포함
- `portfolio[].ratio`: 소수 둘째 자리 고정 (% 기호 포함 문자열)
- `based_on_stock[].person`: 각 종목을 보유한 투자자 리스트(비중 내림차순)
- `person_count`, `avg_ratio`, `sum_ratio`: 각각 보유 투자자 수 / 평균 비중 / 합산 비중

서버 캐싱 (2025-09 신규):

- 기본(lookup 없음) 호출은 서버 인메모리 30분 TTL 캐시 적용 → 동일 프로세스 내 반복 스크래핑 방지
- `refresh=1` 쿼리 파라미터로 강제 재생성: `/api/dataroma/base?refresh=1`
- `lookup` 파라미터 사용 시(부분 필터) 캐시 미사용 (항상 새로 계산)
- 응답 헤더 `X-Cache: HIT|MISS` 로 캐시 여부 확인 가능

클라이언트 캐싱:

- `useStudioData` 훅 내부 React Query: `staleTime: 5분`, `refetchOn*` 비활성화 → SPA 세션 내 재방문 시 재사용
- 강제 갱신: `queryClient.invalidateQueries(['dataroma-base'])` → 이후 훅 재사용 시 서버(캐시 또는 재생성) 호출

변경 이유:

1. 화면 이동 시 잦은 `/api/dataroma/base` 재호출 제거 (네트워크/스크래핑 부담 감소)
2. 종목 상세와 시뮬레이션/포트폴리오 UI 에서 동일한 구조(투자자별 상세 + 종목별 보유자) 필요
3. 서버/클라이언트 이중 캐시로 응답 지연 최소화 및 명시적 무효화 경로 제공

### 2. Studio Home 탭 UI

경로: `/studio/home`

구현:

- 진입 시 React Query 키 `dataroma-base` 로 1회 호출
- `staleTime: Infinity`, `gcTime: Infinity` → 세션 내 재방문 시 재요청 없음
- Tabs (shadcn):
  - Based on Person: 컬럼 (No, Name, Total Value)
  - Based on Stock: 컬럼 (Stock, Person Count, Sum Ratio)

### Stock detail page (studio/stock/[code])

- Navigation: portfolio and simulation lists link to `/studio/stock/{CODE}` when a stock code is clicked.
- Tabs: 투자자 리스트, 종목 차트, 종목 상세, 종목 분석, 종목 토론, 종목 뉴스 (shadcn Tabs).
- Investor lookup logic:

  - Primary: `based_on_person` is searched for portfolios containing the stock code (case-insensitive match of `code` or `pdno`).
  - Fallback: if no persons are found, `based_on_stock` is checked and a summary (person_count, sum_ratio) is shown if available.
  - Matching normalizes codes by trimming and uppercasing to avoid casing/whitespace mismatches.

- News / Discussion (2025-09 개선):
  - 호출: `/api/newsCommunity?query={CODE}`
  - 다중 variant 검색: 원문, trim, 대문자, 공백제거, 특수문자 제거 문자열로 Screener API 순차 시도
  - productCode 미탐색 시 subjectId 직접 시도: 원문 / 대문자 / 숫자만 추출 값으로 `/v3/comments` 호출
  - 성공 시: `{ productCode, comments: [...] }`
  - 실패 시: 404 `{ error: 'PRODUCT_CODE_NOT_FOUND', message, attempts: [{ query, status, resultTypes }] }`
  - `debug=1` 추가 시 응답에 `_debug.attempts` 포함 (문제 재현/분석 용)
  - 캐시 헤더: 10분 CDN (`s-maxage=600`) + stale-while-revalidate=60

Troubleshooting tips:

- If the investor list is empty: verify `/api/dataroma/base` returns `based_on_person` with `portfolio` entries; run `console.log` in the Studio home to inspect the cache.
- If the news/discussion tab shows an error, check server logs for `Screener API returned` or `Community API returned` messages; these indicate upstream non-200 responses.
- To add shadcn components used by the new page, run `npx shadcn@latest add tabs card badge` and follow the prompts.

### 3. 내부 스크래핑 로직

- 파일: `dataroma_portfolio.js`
- `generateDataromaBase()` 호출 → 투자자 페이지 병렬 수집(batch) → 종목 집계
- 향후 추천 포트폴리오(`/api/dataroma/recommended`) 분리 예정

### 4. 확장 아이디어

- 컬럼 정렬 & 필터 (예: person_count 상위만 보기)
- 평균 비중(avg_ratio) 컬럼 노출 토글
- 추천 포트폴리오 탭 (현 `generateRecommendedPortfolio` 활용)
- 다운로드 (CSV/JSON) 버튼
- 주기적 서버 사이드 사전 크롤링 + KV/Edge 캐시 사용

### 5. 간단 사용 예 (클라이언트)

```ts
const { data } = useQuery({
  queryKey: ['dataroma-base'],
  queryFn: () => fetch('/api/dataroma/base').then((r) => r.json()),
  staleTime: Infinity,
});
```

### Dataroma base 공유 컨텍스트 (`useStudioData`)

Studio 영역은 `hooks/useStudioData.ts`에서 제공하는 컨텍스트/훅을 통해 Dataroma 데이터를 포함한 모든 스튜디오 상태를 공유합니다. 내부적으로 React Query 키 `['studio', 'dataroma-base']`를 사용하며, `staleTime` 5분에 `refetchOnWindowFocus` 비활성화로 과도한 네트워크 호출을 방지합니다.

- 제공 항목:
  - `dataromaBasedOnPerson`, `dataromaBasedOnStock`: 정규화된 데이터 배열 (없을 경우 `[]`)
  - `dataromaLoading`, `dataromaError`: 로딩/에러 상태로 UI 분기 처리 가능
  - 기타 스튜디오 전역 상태(계좌, 토큰, 환율, 잔고, 변동 Mutations 등)
- 컨텍스트는 `app/studio/layout.tsx`에서 전역으로 감싸므로, 스튜디오 하위 페이지/컴포넌트는 언제든 `useStudioData()`로 접근할 수 있습니다.

사용 예:

```tsx
import { useStudioData } from '@/hooks/useStudioData';

function MyComponent() {
  const { dataromaBasedOnStock, dataromaLoading } = useStudioData();
  if (dataromaLoading) return <span>Loading…</span>;
  return <pre>{JSON.stringify(dataromaBasedOnStock, null, 2)}</pre>;
}
```

필요 시 최신 데이터를 강제로 로드하려면 `useStudioData().mutations.refreshDataroma()`를 호출하면 됩니다. 내부에서 동일한 React Query 키를 무효화하여 `/api/dataroma/base`를 재호출합니다.

---

### 계좌 설정 섹션 (Account Settings Section)

우측 패널 계좌 잔고 요약 아래 개별 계좌별 전략 파라미터(보유종목수, 현금비중)를 슬라이더로 조정/저장하는 섹션을 추가했습니다.

구현 파일:

- `components/account-settings-section.tsx`
- API 업데이트: `app/api/accounts/route.ts` (GET 응답 및 신규 기본값), 신규 `PATCH /api/accounts/settings` 라우트 (`app/api/accounts/settings/route.ts`)

DB 스키마 추가 필드 (`brokerage_accounts` 테이블):

- `max_positions integer` (NULL 가능, 기본 초기값 20) – 목표 최대 보유 종목 수 (1~50 사이)
- `target_cash_ratio integer` (NULL 가능, 기본 초기값 10) – 목표 현금 비중 % (0~100 사이)

초기값: 새 계좌 등록 시 `max_positions=20`, `target_cash_ratio=10` 으로 삽입.

UI 동작:

1. 활성 계좌 로그인 시 `/api/accounts` GET 재호출 → 해당 계좌 행에서 `max_positions`, `target_cash_ratio` 값을 로드
2. 값 미존재(NULL) 시 기본 20 / 10 으로 표시
3. 슬라이더 조작 → 우측 현재값 라벨 실시간 갱신 (보유종목수: `현재 / 50`, 현금비중: `현재% / 100%`)
4. 변경 발생 시 "미저장" 배지 표시
5. 저장 버튼 클릭 → `PATCH /api/accounts/settings` body `{ accountId, max_positions, target_cash_ratio }`
6. 서버 검증 및 1~50 / 0~100 범위 클램프 후 업데이트. 성공 시 미저장 상태 해제

API 계약:
`PATCH /api/accounts/settings`
Request JSON:

```json
{ "accountId": 123, "max_positions": 35, "target_cash_ratio": 25 }
```

Response (성공):

```json
{
  "success": true,
  "settings": { "id": 123, "max_positions": 35, "target_cash_ratio": 25 }
}
```

에러 코드:

- 400: accountId 누락 / 업데이트 필드 없음 / 범위 벗어난 값(서버에서 자동 클램프 후 저장 또는 필드 미포함)
- 401: 인증 실패
- 500: 서버 내부 오류

범위 규칙 (서버):

- `max_positions`: floor → 1~50 로 클램프
- `target_cash_ratio`: round → 0~100 로 클램프

확장 아이디어:

- 각 설정 변경시 실시간 리밸런싱 시뮬레이터 트리거
- 계좌별 프리셋(보수/중립/공격) 버튼
- 설정 변경 히스토리 로그 테이블
- `target_cash_ratio` 편차 경고 배지 (실제 vs 목표)

테이블 마이그레이션 예시(SQL):

```sql
alter table public.brokerage_accounts
  add column if not exists max_positions integer,
  add column if not exists target_cash_ratio integer;
```

기존 레코드 초기화(옵션):

```sql
update public.brokerage_accounts
  set max_positions = coalesce(max_positions, 20),
      target_cash_ratio = coalesce(target_cash_ratio, 10);
```

주의:

- 새 필드 추가 후 서버 재배포 필요
- RLS 정책이 `select/update` 모두 허용(소유자 행 한정)인지 확인. 기본 RLS 정책에 두 필드 자동 포함됨

프론트엔드 캐싱:

- 설정 저장 후 별도 전역 캐시 없음 (즉시 반영 위해 local state 유지). 다른 컴포넌트에서 필요 시 React Query 키 도입 고려

---

### 포트폴리오 시뮬레이션 (Portfolio Simulation)

경로: `/studio/simulation`

목적: 계좌 전략 파라미터(보유종목수=Top N, 현금비중 %)를 실시간 조정하며 Dataroma 집계(`based_on_stock`) 기반 추천 포트폴리오를 즉각 시각화.

구성:

- 네비게이션: SidebarLeft `포트폴리오 시뮬레이션` 메뉴 추가
- 페이지: `app/studio/simulation/page.tsx`
- 소스 데이터: `GET /api/dataroma/base` (React Query 30분 캐시)
- 이벤트 연동:
  - `account-settings-changed` (설정 슬라이더 변경 / 서버 fetch 완료)
  - `present-balance-updated` (계좌 요약이 output3 수신 시 총자산 브로드캐스트)

알고리즘(클라이언트 계산):

1. 상위 N 종목(slice 0..N) 취득
2. 각 종목 `sum_ratio` 합산 → 투자 비중 (100 - 현금비중) 을 비례 배분
3. 소수 둘째 반올림 후 총합 보정(diff) 첫 종목에 반영
4. 현금비중 > 0 이면 CASH 행 추가 (금액 = USD 총자산 \* 현금비중)

총자산/환율:

- `present-balance-updated` 로 전달된 `tot_asst_amt` (KRW)를 수신
- `/api/exchangeRate` (usd-krw-rate 캐시) 로 USD 환산 → CASH 금액 계산
- 설정 변경 시 presentBalance API 재호출 없이 기존 값 재사용

차트:

- Recharts Pie, 투자자 상세 페이지와 동일 팔레트 (`--chart-1`~`--chart-12`), CASH 는 `--chart-other`

테이블 컬럼:

- Code / Ratio(%) / Persons(person_count) / Cash(USD 추정, 없으면 '-')

커스텀 이벤트 계약:

```ts
// 설정 변경
dispatchEvent(
  new CustomEvent('account-settings-changed', {
    detail: { accountId, max_positions, target_cash_ratio, dirty, source },
  })
);
// 잔고 업데이트
dispatchEvent(
  new CustomEvent('present-balance-updated', {
    detail: { accountId, tot_asst_amt },
  })
);
```

확장 아이디어:

- 서버 `/api/dataroma/recommended` 정식 엔드포인트 (동일 로직 + 검증)
- avg_ratio 기반 모드 전환, 듀얼 비교
- 백테스트 / 변동성 추정 및 효율적 프론티어 근사
- CSV / 이미지 다운로드
- N, 현금비중 프리셋 버튼 (10/20/30, 0/10/20%)

주의:

- Dataroma 데이터는 스냅샷이므로 최신화 스케줄 필요
- USD 총자산은 단순 환산으로 실제 외화 구성 차이 반영 안 됨

테스트 체크리스트:

1. 계좌 로그인 후 Simulation 페이지에서 차트 로드
2. 설정 슬라이더 이동 → Pie/표 즉시 업데이트
3. 현금비중 0% → CASH 행 제거
4. 보유종목수 감소 → 상위 N 종목만 남음
5. 환율 요청 실패 시 CASH 금액 '-' 표시

관련 파일: `account-settings-section.tsx`, `account-balance-section.tsx`, `app/studio/simulation/page.tsx`

---

### (NEW) 계좌 로그인 상태 지속 & Hydration Flash 제거

문제: 페이지 이동(App Router 경로 전환) 직후 우측 사이드바 "계좌" 섹션이 이미 로그인된 계좌가 있음에도 잠시 동안
"계좌 로그인이 되어야 ..." 경고 문구를 표시한 뒤 체크 아이콘으로 전환되는 시각적 플래시가 발생했습니다.

원인:

- `accountTokenStore` 가 비휘발(persist) 되지 않아 기본값(`activeAccountId=null`) 으로 초기 렌더 → 이후 로그인/토큰 설정.
- 혹은 persist 적용 후에도 rehydrate 비동기 과정 전에 컴포넌트가 `activeAccountId` 를 0/ null 로 본 상태에서 경고 문구 렌더.

해결:

1. `accountTokenStore` 에 zustand `persist` 미들웨어 적용 (storage key: `account-token-store`).
2. 스토어 상태에 `hasHydrated` 플래그 추가, `onRehydrateStorage` 콜백에서 `setHasHydrated()` 실행.
3. 재수화 완료 시 글로벌 커스텀 이벤트 `account-token-hydrated` 디스패치 (선택적 의존 컴포넌트 확장 용도).
4. `components/accounts-section.tsx` 에서 경고 문구 렌더 조건을 `hasHydrated && !activeAccountId` 로 변경 → 재수화 이전엔 경고 미표시.
5. 기존 로컬 `activeId` 중복 상태 제거 → 단일 소스(스토어)로 활성 계좌 표시 일관성 확보.

핵심 코드 요약:

```ts
// store/accountTokenStore.ts
export const accountTokenStore = create<State>()(
  persist(
    (set) => ({
      activeAccountId: null,
      tokens: {},
      hasHydrated: false,
      setToken: (t) =>
        set((s) => ({
          tokens: { ...s.tokens, [t.accountId]: t },
          activeAccountId: t.accountId,
        })),
      setHasHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'account-token-store',
      partialize: (s) => ({
        activeAccountId: s.activeAccountId,
        tokens: s.tokens,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
        window.dispatchEvent(new CustomEvent('account-token-hydrated'));
      },
    }
  )
);

// components/accounts-section.tsx (발췌)
const { activeAccountId, hasHydrated } = accountTokenStore();
{
  hasHydrated && !activeAccountId && (
    <p className="text-[10px] text-red-500 mb-1">계좌 로그인이 되어야 ...</p>
  );
}
```

효과:

- 라우트 전환 후 즉시 이전 활성 계좌 체크 아이콘 유지 (무플래시 UX).
- 다중 탭/새 창에서도 동일 localStorage 기반 활성 상태 동기 (브라우저 기본 storage sync 규칙 적용).

추가 고려(미구현):

- 토큰 만료(`expires_in`) 자동 검사 및 만료 시 activeAccountId 해제 / 재발급 플로우.
- 세션 분리(사용자 로그아웃 시 localStorage 계좌 토큰 폐기) → Supabase auth state 변화 훅 연동.
- 이벤트 기반(`account-token-hydrated`) 으로 잔고 섹션 초기 즉시 refetch 트리거 (현재는 로그인 후 발급 이벤트 `account-token-issued` 중심).

테스트 체크리스트:

1. 계좌 로그인 후 다른 /studio/\* 경로로 이동 → 경고 플래시 없음 확인.
2. 새 탭 열기 → 즉시 활성 계좌 체크 표시 (재로그인 요구 없음).
3. localStorage `account-token-store` 삭제 후 새로고침 → 경고 문구 정상 등장.
4. 다중 계좌 로그인/전환 후 브라우저 재시작 → 마지막 active 계좌가 복원되는지 확인.

관련 파일 변경:

- `store/accountTokenStore.ts` : persist + hydration flag + 이벤트 디스패치 추가.
- `components/accounts-section.tsx` : hasHydrated 활용, 로컬 activeId 상태 제거.

확장 아이디어:

- 토큰 만료 10분 전 배지/색상 경고.
- Background refresh (silent renew) 후 `account-token-refreshed` 이벤트로 다른 패널(잔고/시뮬레이션) 자동 최신화.
- 암호화된 IndexedDB(Storage) 전환 (고안된 threat model 필요 시).

---
