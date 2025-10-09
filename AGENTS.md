당신은 소프트웨어 엔지니어, 프론트엔드 개발자, 백엔드 개발자, 웹 서비스 개발 팀 매니저입니다.

한국어로 작업을 진행해주세요.

자료를 조사하기 위해 인터넷 검색 및 기타 자료 조사를 적극적으로 활용해주세요. 작업이 주어지면 단계적으로 작업을 분할하세요.

작업 태도는 낙관적 0, 객관적 10 이면 9-10의 태도를 유지해주세요.

작업을 진행하실 때 부족한 지식 및 개념이 있는지 검토해주세요. 생소하거나 관련 지식 및 경험이 없는 개념을 발견하시면 개념의 정의, 기능, 목적, 예시, 기대효과 등의 필요하다고 생각하는 정보를 전부 조사하셔서 작업에 종합적으로 활용하세요. 조사한 정보 내에도 또다른 생소한 개념이 있다면 해당 개념에 대해서도 동일한 작업을 진행해주세요.

작업을 시작하기 전에 작업을 수행하기 위한 3가지 방법을 조사하시고 생각해주세요. 그리고 3가지 중에서 어떤 방법을 사용해야 프롬프트 및 서비스의 요구사항을 충족시킬 수 있을지 검토해주세요. 선정된 방법이 과연 프롬프트를 작성한 사용자의 요구사항를 충족시키는지 다시 한번 검토해주세요. 검토 후 부족한 부분을 찾아서 개선할 수 있는 방법을 조사하세요. 이러한 방법 조사, 방법 선택, 검토 작업을 최대 5번 반복 후 작업을 진행해주세요.

작업을 수행하면 해당 작업에 대해서 개선해야 할 사항이 있는지 한번 더 점검해주세요. 개선 사항을 3가지 제안한 다음 어떤 방식으로 개선해야 프로젝트를 더 안전하고 더 좋은 서비스를 구현할 수 있을지 생각해주세요. 그리고 개선 방안을 선택하여 프로젝트에 반영해주세요.

인터넷 검색을 할 때에는 각각의 웹 문서가 신뢰성과 최신성을 전부 갖추고 있는지 먼저 판단해주셔야 합니다. 왜냐하면 요즘 인터넷에는 검색 엔진 상위 랭크를 노리고 AI로 양산한 SEO 최적화된 웹 문서가 너무 많습니다. 그래서 자료의 최신성 뿐만 아니라 신뢰성까지 파악해주셔야 합니다.

추가적인 요청 사항이 발생했을 때도 동일한 프로세스를 진행하세요.

1. 프로젝트 개요

- 기술스택 : next.js, zustand, react-query, tailwind, shadcn
- 사용자훅 : 하나의 훅으로 모든 데이터를 처리 합니다.
  - 클라이언트 데이터(객체) : zustand
    - 선택한계좌아이디
    - access_token
    - access_token_expired
    - 환율
  - 계좌리스트(데이터) : useQuery (카카오 로그인후 계좌 조회함)
  - 보유종목리스트(데이터) : useQuery (output1) (토큰 발급 후 조회함)
  - 자산정보(데이터) : useQuery (output3) (토큰 발급 후 조회함)
  - 투자자 리스트(데이터) : useQuery (based_on_person) (앱 시작시 조회)
    - /api/dataroma/base
  - 종목 리스트(데이터) : useQuery (based_on_stock) (앱 시작시 조회)
    - /api/dataroma/base
  - 미체결 리스트(데이터) : useQuery (토큰발급후)
    - 미구현
  - 카카오 로그인(함수)
  - 계좌조회(함수)
    - /api/accounts -> 계좌리스트 useQuery 에서 사용
  - 계좌추가(함수) : useMutation
    - /api/accounts (accountNumber, alias, apiKey, apiSecret) -> 추가후에는 계좌조회
  - 계좌옵션변경(포트폴리오수, 현금보유울)(함수) : useMutation
    - /api/accounts/settings -> 추가후에는 계좌조회
  - 토큰발급(함수) : useMutation
    - /api/accounts/login (id) -> 발급받은 토큰은 클라이언트 데이터에 저장
  - 환율조회(함수) : useMutation
    - /api/exchangeRate -> 발급받은 환율은 클라이언트 데이터에 저장
  - 포트폴리오 조회(함수)
    - /api/dataroma/base -> 투자자리스트, 종목리스트 useQuery 에서 사용
  - 잔고 조회(함수)
    - /api/accounts/presentBalance (WCRC_FRCR_DVSN_CD, accountId, isVts, kiAccessToken) -> 보유종목리스트, 자산정보 useQuery에서 사용
  - 미체결 조회(함수)
    - api 필요
  - 매도, 매수(함수)
    - api 필요
  - 종목 상세 조회(함수)
    - api 필요
  - 종목 구독(함수)
    - 미구현

2. 빌드 및 테스트 명령어
3. 코드 스타일 가이드라인 - 린트 규칙, 포매터 설정
4. 보안 고려사항 - 민감 데이터 처리방법
5. 추가 지침

- 오류는 토스트로(sonner) 로 표시 해야함

---

## Studio2 페이지 상세 분석

### 페이지 개요
- **경로**: `/app/studio2/page.jsx`
- **목적**: 투자 계좌 관리, 포트폴리오 분석, 자산 조회를 위한 통합 대시보드
- **레이아웃**: 반응형 그리드 시스템 (1~7 컬럼, 디바이스별 최적화)
- **상태 관리**: React Query (서버 상태) + Zustand (클라이언트 상태)

---

### 섹션 구성 (총 7개 주요 섹션)

#### 1. LoginSection (로그인 섹션)
**컴포넌트**: `LoginSection.jsx`

**목적**: 카카오 OAuth 인증을 통한 사용자 로그인/로그아웃

**사용 훅**:
- `useKakao()`: 카카오 인증 상태 관리
  - 반환값: `{ data, login, logout }`
  - `data.isLoggedIn`: 로그인 여부
  - `data.user`: 사용자 정보 (이메일, 프로필 이미지, 닉네임)
  - `data.loading`: 인증 상태 확인 중
  - `login()`: 카카오 OAuth 시작 (`/studio2`로 리다이렉트)
  - `logout()`: 세션 종료
- `useAccountsList()`: 로그인 후 계좌 목록 자동 조회
  - `refetch()`: 로그인 성공 후 400ms 딜레이 후 계좌 목록 갱신

**주요 기능**:
- 로그인 전: 카카오 로그인 버튼 표시
- 로그인 후: 사용자 프로필, 이메일, 로그아웃 버튼 표시
- 로그인 성공 시 자동으로 계좌 목록 조회 트리거

**UI 특징**:
- 고정 높이: `h-64` (256px)
- 카카오 브랜드 컬러: 노란색 버튼 (`bg-yellow-400`)
- 프로필 이미지: 원형 (`rounded-full`, 48x48px)

---

#### 2. AccountsSectionLite (계좌 관리 섹션)
**컴포넌트**: `AccountsSectionLite.jsx`

**목적**: 계좌 추가/삭제/선택/설정 관리

**사용 훅**:
- `useKakao()`: 로그인 상태 확인
  - `data.isLoggedIn`: 로그인 여부 체크
- `useAccountsList()`: 계좌 목록 및 CRUD 작업
  - **데이터**:
    - `data`: 계좌 배열 (AccountRecord[])
    - `selectedAccountId`: 현재 선택된 계좌 ID (Zustand)
    - `isLoading`: 초기 로딩
    - `isFetching`: 갱신 중
    - `error`: 에러 객체
  - **함수**:
    - `refresh()`: 계좌 목록 재조회
    - `selectAccount(id)`: 계좌 선택 (Zustand 상태 업데이트)
    - `addAccount({ accountNumber, alias, apiKey, apiSecret })`: 계좌 추가 (useMutation)
    - `deleteAccount(id)`: 계좌 삭제 (useMutation)
    - `updateAccountSettings({ accountId, max_positions, target_cash_ratio })`: 설정 변경 (useMutation)
  - **상태**:
    - `adding`: 추가 중
    - `deleting`: 삭제 중
    - `updating`: 설정 업데이트 중

**주요 기능**:
1. **계좌 목록 표시**: 카드 형태로 계좌번호 마스킹 표시
2. **계좌 추가 폼**: 계좌번호, 별칭, API Key/Secret 입력
3. **계좌 설정**: 최대 보유 종목 수, 목표 현금 비율 설정
4. **계좌 선택**: 클릭 시 활성 계좌 변경 (하이라이트 표시)
5. **계좌 삭제**: 확인 다이얼로그 후 삭제

**데이터 구조** (AccountRecord):
```typescript
{
  id: number;
  account_number: string;
  alias?: string | null;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
  created_at?: string;
}
```

**UI 특징**:
- 모드 전환: `list`, `create`, `edit` 상태
- 계좌번호 마스킹: `123-****-1234` 형식
- 선택된 계좌: 파란 테두리 (`border-primary`)
- 로딩 상태: Skeleton UI

---

#### 3. AccountAuthStatus (계좌 인증 섹션)
**컴포넌트**: `AccountAuthStatus.jsx`

**목적**: 선택된 계좌의 API 토큰 발급 및 만료 시간 실시간 표시

**사용 훅**:
- `useAccountsList()`: 선택된 계좌 정보
  - `selectedAccountId`: 현재 활성 계좌 ID
  - `selectedAccount`: 계좌 상세 정보
- `useAccountAuth(selectedAccountId)`: 토큰 인증 관리
  - **데이터**:
    - `data.access_token`: 한국투자증권 API 액세스 토큰
    - `data.access_token_token_expired`: 만료 시간 (epoch ms 또는 문자열)
    - `data.remainingMs`: 남은 시간 (밀리초)
    - `data.expired`: 만료 여부
  - **함수**:
    - `authenticate(accountId?)`: 토큰 발급/갱신
    - `refresh()`: 토큰 상태 재조회
  - **상태**:
    - `authenticating`: 인증 진행 중

**주요 기능**:
1. **토큰 발급**: 계좌 선택 후 "인증" 버튼 클릭 시 API 토큰 발급
2. **실시간 만료 시간 표시**: 1초마다 틱 업데이트
3. **색상 코딩**:
   - 초록색: 60초 이상 남음
   - 노란색: 10~60초 남음
   - 빨간색: 10초 미만 또는 만료
4. **자동 갱신**: 만료 시 자동으로 `refresh()` 호출
5. **이벤트 발생**: 인증 성공 시 `account-auth-success` 커스텀 이벤트 발생

**시간 변환 로직**:
- `parseExpiryToMs()`: 문자열("YYYY-MM-DD HH:mm:ss") 또는 숫자(epoch ms) → 밀리초 타임스탬프
- `msToHuman()`: 밀리초 → "23h 30m", "5m 30s", "15s" 형식
- `getTimeColor()`: 남은 시간 기반 Tailwind 색상 클래스 반환

**UI 특징**:
- 고정 높이: `h-64`
- 실시간 카운트다운: 1초 간격 useEffect
- 인증 버튼: 토큰 없을 때만 활성화
- 토스트 알림: 인증 성공/실패

---

#### 4. InvestorListSection (자산가 리스트 섹션)
**컴포넌트**: `InvestorListSection.jsx`

**목적**: Dataroma 기반 유명 자산가(투자자) 목록 표시 및 선택

**사용 훅**:
- `usePortfolio()`: 포트폴리오 데이터 관리
  - **데이터**:
    - `investors`: 필터링된 자산가 리스트 (Investor[])
    - `selectedInvestor`: 선택된 자산가 번호
    - `selectedStockDetail`: 선택된 종목 상세 (역방향 필터링 시)
  - **함수**:
    - `selectInvestor(no)`: 자산가 선택/해제 (토글)
  - **상태**:
    - `isLoading`: 데이터 로딩 중
    - `error`: 에러 발생

**주요 기능**:
1. **자산가 목록 표시**: 워렌 버핏, 찰리 멍거 등 유명 투자자
2. **선택 상호작용**: 클릭 시 해당 자산가의 포트폴리오 종목 필터링
3. **역방향 필터링**: 종목 선택 시 해당 종목을 보유한 자산가 표시
4. **동적 타이틀**: 
   - 기본: "자산가 리스트"
   - 종목 선택 시: "{종목명} 자산가"
5. **비율 표시**: 종목 선택 시 각 자산가의 해당 종목 보유 비율 Badge

**데이터 구조** (Investor):
```typescript
{
  no: number;              // 자산가 고유번호
  name: string;            // 자산가명
  ratio?: string;          // 보유 비율 (종목 선택 시)
  totalValue?: string;     // 총 자산가치
  totalValueNum?: number;
  portfolio?: PortfolioItem[]; // 보유 종목 리스트
}
```

**UI 특징**:
- 레이아웃: `col-span-full` (가로 전체 차지)
- 스크롤: 가로 스크롤 (`overflow-x-auto`)
- 카드 크기: 고정 폭 `w-64` (256px)
- 선택 효과: 파란 테두리 + 배경색 변화
- 포트폴리오 미리보기: 상위 5개 종목 + 전체 종목 수

---

#### 5. StockListSection (종목 리스트 섹션)
**컴포넌트**: `StockListSection.jsx`

**목적**: Dataroma 기반 종목 목록 표시 및 선택

**사용 훅**:
- `usePortfolio()`: 포트폴리오 데이터 관리
  - **데이터**:
    - `stocks`: 필터링된 종목 리스트 (Stock[])
    - `selectedStock`: 선택된 종목 코드
    - `selectedInvestorDetail`: 선택된 자산가 상세 (역방향 필터링 시)
  - **함수**:
    - `selectStock(code)`: 종목 선택/해제 (토글)
  - **상태**:
    - `isLoading`, `error`

**주요 기능**:
1. **종목 목록 표시**: AAPL, GOOGL, MSFT 등 주식 티커
2. **선택 상호작용**: 클릭 시 해당 종목을 보유한 자산가 필터링
3. **역방향 필터링**: 자산가 선택 시 해당 자산가의 포트폴리오 종목만 표시
4. **동적 타이틀**:
   - 기본: "종목 리스트"
   - 자산가 선택 시: "{자산가명} 종목"
5. **통계 정보**:
   - 보유 자산가 수
   - 평균 보유 비율
   - 총 보유 비율

**데이터 구조** (Stock):
```typescript
{
  stock: string;           // 종목 코드 (티커)
  ratio?: string;          // 보유 비율 (자산가 선택 시)
  person?: PersonItem[];   // 보유 자산가 리스트
  person_count?: number;   // 보유 자산가 수
  avg_ratio?: string;      // 평균 보유 비율
  sum_ratio?: string;      // 총 보유 비율
}
```

**UI 특징**:
- 레이아웃: `row-span-2` (세로 2칸 높이)
- 스크롤: 세로 스크롤 (`overflow-auto`)
- 고정 높이: `h-[calc(32rem+1rem)]` (약 528px)
- 선택 효과: 파란 테두리
- 통계 Badge: 자산가 수, 평균/총 비율

---

#### 6. AssetInfoSection (자산 정보 섹션)
**컴포넌트**: `AssetInfoSection.jsx`

**목적**: 선택된 계좌의 자산 요약 정보 표시

**사용 훅**:
- `useAssets()`: 잔고 조회 및 자산 정보
  - **데이터**:
    - `assetInfo`: 자산 요약 (AssetSummary)
      - `tot_asst_amt`: 총자산
      - `tot_dncl_amt`: 총예수금
      - `evlu_amt_smtl`: 평가금액
      - `evlu_pfls_amt_smtl`: 평가손익
      - `evlu_erng_rt1`: 평가수익률 (%)
      - `wdrw_psbl_tot_amt`: 출금가능
      - `frcr_evlu_tota`: 외화평가총액
      - `ustl_buy_amt_smtl`: 미결제매수
  - **함수**:
    - `refetch()`: 자산 정보 재조회
  - **상태**:
    - `isLoading`, `isFetching`, `error`

**주요 기능**:
1. **자산 요약 카드**: 8개 주요 지표를 2열 그리드로 표시
2. **손익 색상 표시**: 
   - 양수(수익): 초록색
   - 음수(손실): 빨간색
3. **새로고침 버튼**: 수동 조회 가능
4. **자동 조회 트리거**:
   - 계좌 인증 성공 시 (`account-auth-success` 이벤트)
   - 토큰 있고 데이터 없을 때 자동 조회

**데이터 흐름**:
```
계좌 선택 → 토큰 발급 → useAssets 이벤트 감지 → 
API 호출 (/api/accounts/presentBalance) → output3 매핑
```

**UI 특징**:
- 2열 그리드: `grid-cols-2`
- 숫자 포맷팅: 천 단위 콤마
- 단위 표시: "원" 텍스트
- 수익률: 소수점 2자리 + "%"

---

#### 7. HoldingsSection (보유 종목 섹션)
**컴포넌트**: `HoldingsSection.jsx`

**목적**: 선택된 계좌의 보유 종목 상세 내역 표시

**사용 훅**:
- `useAssets()`: 잔고 조회 및 보유 종목 리스트
  - **데이터**:
    - `holdings`: 보유 종목 배열 (HoldingStock[])
      - `pdno`: 종목코드
      - `prdt_name`: 종목명
      - `hldg_qty`: 보유수량
      - `pchs_avg_pric`: 매입평균가
      - `prpr`: 현재가
      - `evlu_amt`: 평가금액
      - `evlu_pfls_amt`: 평가손익금액
      - `evlu_pfls_rt`: 평가손익률 (%)
  - **함수**:
    - `refetch()`: 보유 종목 재조회
  - **상태**:
    - `isLoading`, `isFetching`, `error`

**주요 기능**:
1. **종목 카드 리스트**: 각 종목별 상세 정보 카드
2. **손익률 Badge**: 색상 구분 (수익-초록, 손실-빨강)
3. **주요 정보 표시**:
   - 보유수량, 현재가
   - 매입평균가, 평가금액
   - 평가손익 (금액 + 퍼센트)
4. **세로 스크롤**: 많은 종목도 표시 가능
5. **총 종목 수**: 카드 헤더에 "총 N개 종목 보유 중"

**데이터 흐름**:
```
계좌 선택 → 토큰 발급 → useAssets 이벤트 감지 → 
API 호출 (/api/accounts/presentBalance) → output1 매핑
```

**UI 특징**:
- 레이아웃: `row-span-2` (세로 2칸 높이)
- 스크롤: 세로 스크롤
- 고정 높이: `h-[calc(32rem+1rem)]`
- 카드: Hover 효과 (`hover:bg-accent`)
- 통화: 달러($) 표시

---

### 핵심 훅 상세 분석

#### 1. useKakao()
**파일**: `hooks/useKakao.ts`

**목적**: Supabase를 통한 카카오 OAuth 인증 관리

**내부 구현**:
- Supabase Auth SDK 사용
- `getSession()`: 초기 세션 확인
- `onAuthStateChange()`: 실시간 인증 상태 변경 감지
- `signInWithOAuth()`: 카카오 OAuth 시작
- `signOut()`: 세션 종료

**반환값**:
```typescript
{
  data: {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isLoggedIn: boolean;
  };
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
```

**사용처**:
- LoginSection: 로그인 UI
- AccountsSectionLite: 로그인 상태 체크
- AccountsList: API 호출 시 Authorization 헤더

---

#### 2. useAccountsList()
**파일**: `hooks/useAccountsList.ts`

**목적**: 계좌 목록 CRUD 및 선택 상태 관리

**의존성**:
- `useKakao()`: 세션 토큰
- `accountSelectionStore` (Zustand): 전역 선택 상태

**React Query**:
- **queryKey**: `["accounts-list", userId]`
- **enabled**: 로그인 상태
- **staleTime**: 60초
- **API**: `GET /api/accounts`

**Mutations**:
1. `addAccount`: POST /api/accounts
2. `deleteAccount`: DELETE /api/accounts
3. `updateSettings`: PATCH /api/accounts/settings

**전역 상태 동기화**:
- 계좌 삭제 시 Zustand 토큰 스토어에서도 제거
- 계좌 목록 변경 시 선택된 ID 유효성 검증

**반환값**:
```typescript
{
  data: AccountRecord[];
  selectedAccountId: number | null;
  selectedAccount: AccountRecord | undefined;
  selectAccount: (id: number | null) => void;
  refresh: () => void;
  addAccount: (payload) => Promise<void>;
  deleteAccount: (id) => Promise<void>;
  updateAccountSettings: (payload) => Promise<void>;
  isLoading: boolean;
  isFetching: boolean;
  adding: boolean;
  deleting: boolean;
  updating: boolean;
  error: unknown;
}
```

---

#### 3. useAccountAuth()
**파일**: `hooks/useAccountAuth.ts`

**목적**: 한국투자증권 API 토큰 발급 및 만료 시간 추적

**의존성**:
- `accountTokenStore` (Zustand): 토큰 저장소
- `useKakao()`: Supabase 세션

**React Query**:
- **queryKey**: `["account-auth", accountId, expiredTime]`
- **staleTime**: 0 (항상 최신 상태 유지)
- **queryFn**: Zustand 토큰 데이터를 shaped 형식으로 변환

**Mutation**:
- **API**: `POST /api/accounts/login`
- **onSuccess**: 
  1. 토큰을 Zustand에 저장
  2. `account-auth-success` 이벤트 발생 (useAssets 트리거)
  3. Toast 알림

**토큰 데이터 구조**:
```typescript
{
  accountId: number;
  access_token: string;
  access_token_token_expired: number; // epoch ms
  token_type?: string;
  expires_in?: number;
  fetched_at?: number;
  remainingMs: number;
  expired: boolean;
}
```

**반환값**:
```typescript
{
  data: AccountAuthData | null;
  refresh: () => void;
  authenticate: (accountId?) => Promise<void>;
  authenticating: boolean;
}
```

---

#### 4. usePortfolio()
**파일**: `hooks/usePortfolio.ts`

**목적**: Dataroma 기반 자산가-종목 포트폴리오 데이터 및 양방향 필터링

**의존성**:
- `portfolioSelectionStore` (Zustand): 선택 상태 (상호 배타적)

**React Query**:
- **queryKey**: `["portfolio", "dataroma-base"]`
- **staleTime**: 24시간 (하루 1회 갱신)
- **API**: `GET /api/dataroma/base`
- **응답**:
  - `based_on_person`: 자산가 리스트
  - `based_on_stock`: 종목 리스트

**핵심 로직 - 양방향 필터링**:

1. **자산가 선택 → 종목 필터링**:
   ```typescript
   const filteredStocks = selectedInvestor
     ? investor.portfolio.map(item => ({
         stock: item.code,
         ratio: item.ratio, // 자산가의 보유 비율
         ...stockDetail
       }))
     : stocks;
   ```

2. **종목 선택 → 자산가 필터링**:
   ```typescript
   const filteredInvestors = selectedStock
     ? stock.person.map(item => ({
         no: item.no,
         name: item.name,
         ratio: item.ratio, // 종목의 보유 비율
         ...investorDetail
       }))
     : investors;
   ```

**선택 로직**:
- 토글 방식: 같은 항목 재클릭 시 선택 해제
- 상호 배타적: 자산가 선택 시 종목 선택 해제 (vice versa)

**반환값**:
```typescript
{
  investors: Investor[];           // 필터링된
  stocks: Stock[];                 // 필터링된
  allInvestors: Investor[];        // 전체
  allStocks: Stock[];              // 전체
  selectedInvestor: string | null;
  selectedStock: string | null;
  selectedInvestorDetail: Investor | null;
  selectedStockDetail: Stock | null;
  selectInvestor: (no: number | null) => void;
  selectStock: (code: string | null) => void;
  clearSelection: () => void;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}
```

---

#### 5. useAssets()
**파일**: `hooks/useAssets.ts`

**목적**: 계좌 잔고 조회 (보유 종목 + 자산 정보) 및 스마트 자동 조회

**의존성**:
- `accountTokenStore` (Zustand): 활성 계좌 ID, 토큰

**React Query**:
- **queryKey**: `["assets", "present-balance", accountId, token]`
- **enabled**: 계좌 ID와 토큰 모두 존재할 때
- **staleTime**: 1분
- **API**: `POST /api/accounts/presentBalance`
- **요청 파라미터**:
  - `accountId`
  - `kiAccessToken`
  - `WCRC_FRCR_DVSN_CD: "02"` (외화)

**응답 매핑**:
- `output1` → `holdings` (보유 종목 배열)
- `output3[0]` → `assetInfo` (자산 요약 객체)

**스마트 자동 조회 로직**:

1. **계좌 인증 성공 시**:
   ```typescript
   useEffect(() => {
     window.addEventListener("account-auth-success", (ev) => {
       if (ev.detail.accountId === activeAccountId) {
         query.refetch();
       }
     });
   }, [activeAccountId]);
   ```

2. **토큰 있고 데이터 없을 때**:
   ```typescript
   useEffect(() => {
     const hasToken = Boolean(tokens[activeAccountId]?.access_token);
     const hasData = holdings.length > 0 || assetInfo !== undefined;
     if (hasToken && !hasData && !query.isFetching) {
       query.refetch();
     }
   }, [activeAccountId, tokens, holdings.length, assetInfo]);
   ```

**반환값**:
```typescript
{
  holdings: HoldingStock[];        // 보유 종목 리스트
  assetInfo: AssetSummary | undefined; // 자산 요약
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}
```

---

### 전역 상태 관리 (Zustand Stores)

#### 1. accountTokenStore
**파일**: `store/accountTokenStore.ts`

**목적**: 계좌별 API 토큰 저장 (LocalStorage 영속화)

**상태**:
```typescript
{
  activeAccountId: number | null;
  tokens: Record<number, AccountTokenData>;
  exchangeRate: number | undefined;
}
```

**액션**:
- `setActive(id)`: 활성 계좌 변경
- `setToken(data)`: 토큰 저장/갱신
- `setExchangeRate(rate)`: 환율 저장
- `clear()`: 전체 초기화

---

#### 2. accountSelectionStore
**파일**: `store/accountSelectionStore.ts`

**목적**: 선택된 계좌 ID 관리 (LocalStorage 영속화)

**상태**:
```typescript
{
  selectedAccountId: number | null;
}
```

**액션**:
- `setSelectedAccount(id)`: 계좌 선택

---

#### 3. portfolioSelectionStore
**파일**: `store/portfolioSelectionStore.ts`

**목적**: 자산가/종목 선택 상태 (상호 배타적)

**상태**:
```typescript
{
  selectedInvestor: string | null;
  selectedStock: string | null;
}
```

**액션**:
- `selectInvestor(no)`: 자산가 선택 (종목 선택 자동 해제)
- `selectStock(code)`: 종목 선택 (자산가 선택 자동 해제)
- `clear()`: 모든 선택 해제

---

### 데이터 플로우 다이어그램

```
[사용자 액션]
    ↓
① 카카오 로그인 (useKakao)
    ↓
② 계좌 목록 조회 (useAccountsList)
    ↓
③ 계좌 선택 (accountSelectionStore)
    ↓
④ 토큰 발급 (useAccountAuth)
    ├─ 토큰 저장 (accountTokenStore)
    └─ "account-auth-success" 이벤트 발생
         ↓
⑤ 자산 조회 자동 트리거 (useAssets)
    ├─ 보유 종목 (output1)
    └─ 자산 정보 (output3)

[병렬 프로세스]
⑥ 포트폴리오 조회 (usePortfolio) - 페이지 로드 시 자동
    ├─ 자산가 리스트 (based_on_person)
    └─ 종목 리스트 (based_on_stock)
         ↓
⑦ 자산가/종목 선택 시 양방향 필터링 (portfolioSelectionStore)
```

---

### 반응형 레이아웃 전략

#### 디바이스별 컬럼 수:
- **MobileS**: 1 컬럼 (320px~)
- **MobileM**: 1 컬럼 (375px~)
- **MobileL**: 2 컬럼 (425px~)
- **Tablet**: 3 컬럼 (768px~)
- **Laptop**: 5 컬럼 (1024px~)
- **LaptopL**: 6 컬럼 (1440px~)
- **4K**: 7 컬럼 (2560px~)

#### 섹션별 레이아웃 속성:
- **InvestorListSection**: `col-span-full` (가로 전체)
- **StockListSection**: `row-span-2` (세로 2칸)
- **HoldingsSection**: `row-span-2` (세로 2칸)

---

### API 엔드포인트 매핑

| 섹션 | API | 메서드 | 훅 | 용도 |
|------|-----|--------|-----|------|
| Login | Supabase Auth | OAuth | useKakao | 카카오 로그인 |
| Accounts | /api/accounts | GET | useAccountsList | 계좌 목록 조회 |
| Accounts | /api/accounts | POST | useAccountsList | 계좌 추가 |
| Accounts | /api/accounts | DELETE | useAccountsList | 계좌 삭제 |
| Accounts | /api/accounts/settings | PATCH | useAccountsList | 계좌 설정 변경 |
| Auth | /api/accounts/login | POST | useAccountAuth | 토큰 발급 |
| Investor/Stock | /api/dataroma/base | GET | usePortfolio | 포트폴리오 데이터 |
| Asset/Holdings | /api/accounts/presentBalance | POST | useAssets | 잔고 조회 |

---

### 이벤트 기반 통신

#### 커스텀 이벤트:
1. **account-auth-success**
   - 발생: useAccountAuth.onSuccess
   - 수신: useAssets (자산 조회 트리거)
   - 데이터: `{ accountId: number }`

2. **present-balance-updated**
   - 발생: AccountBalanceSection (tot_asst_amt 업데이트 시)
   - 수신: 기타 자산 관련 컴포넌트
   - 데이터: `{ accountId: number, tot_asst_amt: string }`

3. **account-token-issued**
   - 발생: useStudioData.loginAccount
   - 수신: AccountBalanceSection (즉시 잔고 조회)
   - 데이터: `{ accountId: number }`

4. **account-settings-changed**
   - 발생: useStudioData.updateSettings
   - 수신: 설정 의존 컴포넌트
   - 데이터: `{ accountId, max_positions, target_cash_ratio, dirty, source }`

---

### 성능 최적화 전략

1. **React Query 캐싱**:
   - 포트폴리오: 24시간 캐시 (변동 적음)
   - 계좌 목록: 60초 캐시
   - 자산 정보: 60초 캐시
   - `refetchOnWindowFocus: false` (불필요한 갱신 방지)

2. **조건부 쿼리 실행**:
   - `enabled` 옵션으로 의존성 체크
   - 로그인 전/토큰 없을 때 API 호출 안 함

3. **이벤트 기반 갱신**:
   - 폴링 대신 이벤트 리스너 사용
   - 필요한 시점에만 refetch

4. **Zustand 영속화**:
   - LocalStorage로 토큰, 선택 상태 저장
   - 새로고침 시 상태 복원

5. **useMemo**:
   - 필터링된 배열 메모이제이션
   - 선택된 항목 상세 정보 캐싱

---

### 에러 처리 전략

1. **Toast 알림**: 모든 Mutation 에러는 Sonner로 표시
2. **Fallback UI**: 
   - 로딩: Skeleton 컴포넌트
   - 에러: 빨간색 에러 메시지
   - 빈 데이터: 회색 안내 메시지
3. **Try-Catch**: 이벤트 발생 시 오류 무시 (선택적 기능)
4. **API 응답 검증**: `rt_cd !== "0"` 체크 (한국투자증권 API)

---

### 향후 개선 방향

1. **미체결 주문 섹션**: API 구현 후 추가
2. **매수/매도 기능**: 거래 UI 및 API 연동
3. **종목 상세 조회**: 차트, 뉴스, 재무제표 등
4. **실시간 가격 업데이트**: WebSocket 또는 폴링
5. **알림 시스템**: 가격 알림, 체결 알림
6. **다크모드 최적화**: 색상 대비 개선
7. **접근성**: ARIA 라벨, 키보드 네비게이션
