# 📋 Dashboard 페이지 리팩토링 작업 계획

## 🎯 목표

대시보드 페이지(`app/dashboard/page.jsx`)의 가독성과 유지보수성 향상을 위한 컴포넌트 및 로직 분리

---

## 🧩 컴포넌트 분리 계획

### 1. 메뉴바 컴포넌트들

```
📁 components/navigation/
├── NavigationMenu.jsx        // 메인 메뉴바
├── NavigationItem.jsx        // 개별 메뉴 아이템
└── NavigationControls.jsx    // 상단 도구 모음 (화살표, 플레이 등)
```

**작업 내용:**

- [x] 현재 Header 컴포넌트를 NavigationMenu로 리네이밍
- [ ] 개별 메뉴 아이템 로직 분리
- [ ] 상단 도구 모음(ArrowLeft, ArrowRight, Play, Settings) 컴포넌트화

### 2. 종목리스트 컴포넌트들

```
📁 components/stock-list/
├── StockListContainer.jsx    // 종목 리스트 컨테이너
├── StockListItem.jsx         // 개별 종목 아이템 (AsideItem 통합)
├── StockListSummary.jsx      // 상단 요약 정보 (총 손익 등)
└── StockListSkeleton.jsx     // 로딩 스켈레톤
```

**작업 내용:**

- [ ] 현재 Aside 컴포넌트를 StockListContainer로 분리
- [ ] AsideItem의 복잡한 조건부 렌더링을 StockListItem으로 정리
- [ ] 잔고/체결/미체결/분석별 아이템 렌더링 로직 분리
- [ ] StockListSummary, StockListSkeleton 등 상태별 컴포넌트 분리

### 3. 메인 영역 컴포넌트들

```
📁 components/main-content/
├── MainContentTabs.jsx       // 메인 탭 컨테이너
├── StockInfoCard.jsx         // 종목 카드 (슬라이드) - SectionTitle 역할
├── ChartSection.jsx          // 차트 영역
├── StockInfoSection.jsx      // 종목정보 영역
└── CommunitySection.jsx      // 커뮤니티 영역
```

**작업 내용:**

- [ ] Main 컴포넌트 내부의 Tabs 로직을 MainContentTabs로 분리
- [ ] SectionTitle을 StockInfoCard로 개선하여 슬라이드 기능 포함
- [ ] 각 TabsContent를 독립적인 컴포넌트로 분리
- [ ] 종목정보의 복잡한 Card 구조를 StockInfoSection으로 정리

### 4. 공통 컴포넌트들

```
📁 components/common/
├── LoadingState.jsx          // 로딩 상태
├── EmptyState.jsx           // 빈 데이터 상태 (StockListNoData)
├── ErrorState.jsx           // 에러 상태
└── LoginAlert.jsx           // 로그인 알림 (StockListLoginAlert)
```

**작업 내용:**

- [ ] StockListSkeleton, StockListNoData, StockListLoginAlert를 공통 컴포넌트로 정리
- [ ] 재사용 가능한 상태 컴포넌트들 생성

---

## 🎣 커스텀 훅 분리 계획

### 1. 상태 관리 훅들

```
📁 hooks/state/
├── useNavigationState.js     // 메뉴, current 상태 관리
├── useAutoPlayState.js       // 자동재생 관련 상태
└── useTradingState.js        // 매매 관련 상태
```

**useNavigationState.js 작업 내용:**

```javascript
export default function useNavigationState() {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [current, setCurrent] = useState(0);

  const handleMenuChange = (newActive) => {
    setActiveItem(newActive);
    setCurrent(0); // 메뉴 변경 시 첫 번째 항목으로 이동
  };

  return {
    activeItem,
    current,
    setCurrent,
    handleMenuChange,
    navMain: data.navMain,
  };
}
```

**useAutoPlayState.js 작업 내용:**

```javascript
export default function useAutoPlayState() {
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoBuy, setAutoBuy] = useState(false);
  const [autoSell, setAutoSell] = useState(false);

  const toggleAutoPlay = () => setAutoPlay(!autoPlay);
  const toggleAutoBuy = () => setAutoBuy(!autoBuy);
  const toggleAutoSell = () => setAutoSell(!autoSell);

  return {
    autoPlay,
    autoBuy,
    autoSell,
    toggleAutoPlay,
    toggleAutoBuy,
    toggleAutoSell,
  };
}
```

### 2. 데이터 훅들

```
📁 hooks/data/
├── useStockData.js          // 모든 주식 데이터 통합
├── useStockDetail.js        // 개별 종목 상세 데이터
└── useStockAnalysis.js      // 종목 분석 데이터
```

**useStockData.js 작업 내용:**

```javascript
const KEY_MAP = {
  잔고: 'ovrs_pdno',
  체결: 'pdno',
  미체결: 'pdno',
  기간손익: 'ovrs_pdno',
  분석: 'name',
};

export default function useStockData(activeItem, current) {
  // 기본 데이터 훅들
  const { analysisData, isPending: analysisPending } = useAnalysis(120000);
  const { balanceData, isPending: balancePending } = useHolding(120000);
  const { data: cnnlData, isPending: cnnlPending } = useCnnl(120000);
  const { profitData, isPending: profitPending } = useProfit();
  const { data: exchangeRateData } = useExchangeRate();

  // 리스트 데이터 계산 (복잡한 switch-case 로직)
  const list = useMemo(() => {
    // 현재 page.jsx의 복잡한 리스트 생성 로직을 여기로 이동
  }, [activeItem, analysisData, balanceData, cnnlData, profitData]);

  // 현재 종목 분석 데이터
  const currentAnalysisData = useMemo(() => {
    // 현재 선택된 종목의 분석 데이터 반환
  }, [analysisData, current, list, activeItem]);

  return {
    list,
    currentAnalysisData,
    isLoading,
    exchangeRate,
    // ... 기타 데이터들
  };
}
```

### 3. 비즈니스 로직 훅들

```
📁 hooks/business/
├── useStockNavigation.js    // 종목 네비게이션 로직
├── useDataFetching.js       // 데이터 페칭 로직
└── useAutoTrading.js        // 자동매매 로직
```

**useStockNavigation.js 작업 내용:**

```javascript
export default function useStockNavigation(current, list, activeItem) {
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (list?.length || 1));
  }, [list?.length]);

  const getDetailData = useCallback(() => {
    // 상세 데이터 조회 로직
  }, [current, list, activeItem]);

  const handleChartChange = useCallback(() => {
    // 차트 변경 로직
  }, []);

  return {
    next,
    getDetailData,
    handleChartChange,
  };
}
```

---

## 📁 리팩토링된 최종 구조

### 새로운 page.jsx 구조:

```jsx
'use client';

import { useState } from 'react';
import PageWrap from './components/layout/PageWrap';
import NavigationMenu from './components/navigation/NavigationMenu';
import StockListContainer from './components/stock-list/StockListContainer';
import MainContentTabs from './components/main-content/MainContentTabs';
import { Toaster } from 'sonner';

// 커스텀 훅들
import useNavigationState from './hooks/state/useNavigationState';
import useStockData from './hooks/data/useStockData';
import useStockNavigation from './hooks/business/useStockNavigation';

export default function DashBoardPage() {
  // 상태 관리
  const { activeItem, current, setCurrent, handleMenuChange } =
    useNavigationState();

  // 데이터 관리
  const { list, currentAnalysisData, isLoading, exchangeRate } = useStockData(
    activeItem,
    current
  );

  // 네비게이션 로직
  const { next, getDetailData, handleChartChange } = useStockNavigation(
    current,
    list,
    activeItem
  );

  return (
    <PageWrap>
      <Toaster />

      {/* 메뉴바 */}
      <NavigationMenu activeItem={activeItem} onChange={handleMenuChange} />

      {/* 종목 리스트 */}
      <StockListContainer
        activeItem={activeItem}
        list={list}
        current={current}
        setCurrent={setCurrent}
        isLoading={isLoading}
        exchangeRate={exchangeRate}
      />

      {/* 메인 컨텐츠 */}
      <MainContentTabs
        current={current}
        setCurrent={setCurrent}
        list={list}
        currentAnalysisData={currentAnalysisData}
        onNext={next}
        onChartChange={handleChartChange}
      />
    </PageWrap>
  );
}
```

---

## ✅ 작업 체크리스트

### Phase 1: 커스텀 훅 분리

- [ ] `useNavigationState.js` 생성
- [ ] `useAutoPlayState.js` 생성
- [ ] `useTradingState.js` 생성
- [ ] `useStockData.js` 생성
- [ ] `useStockNavigation.js` 생성

### Phase 2: 공통 컴포넌트 분리

- [ ] `LoadingState.jsx` 생성
- [ ] `EmptyState.jsx` 생성
- [ ] `ErrorState.jsx` 생성
- [ ] `LoginAlert.jsx` 생성

### Phase 3: 네비게이션 컴포넌트 분리

- [ ] `NavigationMenu.jsx` 생성
- [ ] `NavigationItem.jsx` 생성
- [ ] `NavigationControls.jsx` 생성

### Phase 4: 종목리스트 컴포넌트 분리

- [ ] `StockListContainer.jsx` 생성
- [ ] `StockListItem.jsx` 생성 (AsideItem 로직 통합)
- [ ] `StockListSummary.jsx` 생성

### Phase 5: 메인 컨텐츠 컴포넌트 분리

- [ ] `MainContentTabs.jsx` 생성
- [ ] `StockInfoCard.jsx` 생성
- [ ] `ChartSection.jsx` 생성
- [ ] `StockInfoSection.jsx` 생성
- [ ] `CommunitySection.jsx` 생성

### Phase 6: 최종 통합 및 테스트

- [ ] 새로운 구조로 `page.jsx` 리팩토링
- [ ] 모든 기능 동작 확인
- [ ] 성능 최적화 검토
- [ ] 타입스크립트 적용 검토

---

## 🚀 기대 효과

### 코드 품질 향상:

- **가독성 향상**: 각 컴포넌트가 명확한 역할
- **재사용성**: 다른 페이지에서도 활용 가능
- **유지보수성**: 버그 수정이나 기능 추가가 쉬워짐
- **테스트 용이성**: 개별 컴포넌트 단위 테스트 가능

### 성능 최적화:

- **필요한 부분만 리렌더링**: React.memo 적용 가능
- **코드 스플리팅**: 지연 로딩 적용 가능
- **메모리 최적화**: 불필요한 상태 제거

### 개발 경험 향상:

- **디버깅 용이**: 문제 발생 지점 빠른 특정
- **협업 효율성**: 팀원간 작업 분담 용이
- **확장성**: 새로운 기능 추가 시 구조적 접근 가능

---

## 📝 참고사항

- 기존 기능을 유지하면서 점진적으로 리팩토링 진행
- 각 단계별로 충분한 테스트 수행
- 성능 측정을 통한 개선 효과 검증
- 타입스크립트 적용 시 점진적 마이그레이션 고려

---

_최종 업데이트: 2025-07-25_
