## API

### TradingView

#### /api/tradingview/scanner/[market]
- example: /api/tradingview/scanner/nasdaq
- query parameters: codes, symbols, tickers

### Supabase

#### 한국투자증권에서 사용할 api_key, secret_key 를 brokerage_accounts 테이블에서 조회
모듈 : /lib/koreaInvest.ts

### KoreaInvest

#### /api/korea-invest/token
- **설명**: OAuth2 접근토큰 발급 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/oauth2
- **원본 API**: `/oauth2/tokenP`
- **Method**: POST
- **도메인**: https://openapi.koreainvestment.com:9443


##### 요청 (Request)

**Headers**
| 헤더명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `authorization` | O | 접근토큰 | `Bearer {SUPABASE_ACCESS_TOKEN}` |
| `content-type` | X | 콘텐츠 타입 | `application/json` |

**Body (JSON) - 선택사항**
```json
{
  "accountId": "선택사항_계좌ID" 
}
```
* `accountId`를 생략하면 사용자의 첫 번째 계좌를 사용합니다.

##### 응답 (Response)

**Body**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "account_no": "1234567801"
}
```

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `access_token` | String | 한투 접근 토큰 | JWT 형식 |
| `token_type` | String | 토큰 타입 | `Bearer` |
| `expires_in` | Number | 유효 시간 (초) | `86400` |
| `account_no` | String | 사용된 계좌번호 | `1234567801` |

**참고**
- 이 API는 내부적으로 `brokerage_accounts` 테이블에서 사용자의 API Key를 조회하여 토큰을 발급받습니다.
- 클라이언트에서 별도로 `appkey`를 관리할 필요가 없습니다.

---

#### /api/korea-invest/bunbong
- **설명**: 해외주식 분봉 조회 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock-quotations
- **원본 API**: `/uapi/overseas-price/v1/quotations/inquire-time-itemchartprice`
- **TR ID**: `HHDFS76950200`
- **Method**: GET
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**
| 헤더명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `authorization` | O | 접근토큰 | `Bearer {SUPABASE_ACCESS_TOKEN}` |
| `content-type` | X | 콘텐츠 타입 | `application/json` |

**Query Parameters**
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `AUTH` | X | String | (한투 내부용) | 보통 공백 전송 |
| `EXCD` | O | String | 거래소 코드 | `NAS` (나스닥), `NYS` (뉴욕), `AMS` (아멕스) |
| `SYMB` | O | String | 종목 코드 | `AAPL`, `TSLA`, `MSFT` |
| `NMIN` | X | String | 분봉 주기 | `0` (틱), `1` (1분), `3` (3분), `5` (5분), `10` (10분), `15` (15분), `30` (30분), `60` (60분) (기본값: 1) |
| `PINC` | X | String | 전일 포함 여부 | `0` (미포함), `1` (포함) (기본값: 0) |
| `NEXT` | X | String | 다음 조회 여부 | 공백 (초기 조회), `Y` (다음 데이터) (기본값: 공백) |
| `NREC` | X | String | 조회 건수 | 최대 `120` (기본값: 120) |
| `FILL` | X | String | 미체결 채우기 | `0` (미사용), `1` (사용) |
| `KEYB` | X | String | 연속 조회 키 | 다음 조회 시 이전 응답의 KEYB 값 사용 |

**거래소 코드 (EXCD)**
- `NAS`: 나스닥
- `NYS`: 뉴욕증권거래소
- `AMS`: 아멕스
- `TSE`: 도쿄증권거래소
- `HKS`: 홍콩증권거래소
- `SHS`: 상해증권거래소
- `SZS`: 심천증권거래소
- `HSX`: 호치민증권거래소
- `HNX`: 하노이증권거래소

##### 응답 (Response)

**Body**
```json
{
  "rt_cd": "0",
  "msg_cd": "MCA00000",
  "msg1": "정상처리 되었습니다.",
  "output1": {
    "rsym": "NASD@AAPL",
    "zdiv": "1",
    "gubn": "1"
  },
  "output2": [
    {
      "xymd": "20231127",
      "xhms": "093000",
      "open": "189.50",
      "high": "189.80",
      "low": "189.40",
      "clos": "189.70",
      "evol": "125000",
      "eamt": "23712500.00",
      "prdy": "189.30",
      "rate": "0.21",
      "pbid": "189.65",
      "pask": "189.75",
      "vbid": "5000",
      "vask": "3000"
    }
  ],
  "output3": {
    "nrec": "120",
    "nkey": "20231127093000"
  }
}
```

---

#### /api/korea-invest/daily
- **설명**: 해외주식 일별시세 조회 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock-quotations
- **원본 API**: `/uapi/overseas-price/v1/quotations/dailyprice`
- **TR ID**: `HHDFS76240000`
- **Method**: GET
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**: bunbong과 동일

**Query Parameters**
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `AUTH` | X | String | (한투 내부용) | 보통 공백 전송 |
| `EXCD` | O | String | 거래소 코드 | `NAS`, `NYS` 등 |
| `SYMB` | O | String | 종목 코드 | `AAPL`, `TSLA` |
| `GUBN` | X | String | 일/주/월 구분 | `0` (일), `1` (주), `2` (월) (기본값: 0) |
| `BYMD` | X | String | 조회 시작일 | `YYYYMMDD` 형식 (기본값: 공백) |
| `MODP` | X | String | 수정주가 반영 여부 | `0` (미반영), `1` (반영) (기본값: 1) |
| `KEYB` | X | String | 연속 조회 키 | 연속조회 시 사용 |

---

#### /api/korea-invest/current-price
- **설명**: 해외주식 현재가 상세 조회 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock-quotations
- **원본 API**: `/uapi/overseas-price/v1/quotations/price-detail`
- **TR ID**: `HHDFS76950100`
- **Method**: GET
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**: bunbong과 동일 (tr_id만 `HHDFS76950100`)

**Query Parameters**
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `AUTH` | X | String | (한투 내부용) | 보통 공백 전송 |
| `EXCD` | O | String | 거래소 코드 | `NAS`, `NYS` 등 |
| `SYMB` | O | String | 종목 코드 | `AAPL`, `TSLA` |

##### 응답 (Response)

**주요 필드**: 현재가, OHLC, 거래량/대금, 52주 최고/최저가, PER/PBR/EPS/BPS, 시가총액

---

#### /api/korea-invest/order
- **설명**: 해외주식 매매 주문 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock
- **원본 API**: `/uapi/overseas-stock/v1/trading/order`
- **TR ID**: 매수 `TTTT1002U`, 매도 `TTTT1006U`
- **Method**: POST
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**
| 헤더명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `authorization` | O | 접근토큰 | `Bearer {SUPABASE_ACCESS_TOKEN}` |
| `content-type` | O | 콘텐츠 타입 | `application/json` |

**Body (JSON)**
```json
{
  "accountId": 7,
  "orderType": "BUY",
  "EXCD": "NASD",
  "SYMB": "AAPL",
  "QTY": "10",
  "PRICE": "189.50",
  "ORD_DVSN": "00"
}
```

| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `orderType` | O | String | 주문 구분 | `BUY` (매수), `SELL` (매도) |
| `EXCD` | O | String | 해외거래소코드 | `NASD`, `NYSE`, `AMEX` 등 |
| `SYMB` | O | String | 종목코드 | `AAPL`, `TSLA` 등 |
| `QTY` | O | String | 주문수량 | 주문할 주식 수량 |
| `PRICE` | O | String | 주문단가 | `0` (시장가), 또는 지정가격 |
| `ORD_DVSN` | O | String | 주문구분 | `00` (지정가), `01` (시장가) |

* `CANO`(계좌번호) 등 민감 정보는 서버에서 자동 주입됩니다.

##### 응답 (Response)

**주요 필드**: `ODNO` (주문번호), `ORD_TMD` (주문시각)

---

#### /api/korea-invest/balance
- **설명**: 해외주식 잔고 조회 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock
- **원본 API**: `/uapi/overseas-stock/v1/trading/inquire-present-balance`
- **TR ID**: `CTRP6504R`
- **Method**: GET
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**: bunbong과 동일 (tr_id만 `CTRP6504R`)

**Query Parameters**
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `CANO` | X | String | 종합계좌번호 | (선택) 자동 주입됨 |
| `ACNT_PRDT_CD` | X | String | 계좌상품코드 | (선택) 자동 주입됨 |
| `EXCD` | X | String | 해외거래소코드 | `NASD`, `NYSE` 등 (기본값: NASD) |
| `CURRENCY` | X | String | 거래통화코드 | `USD`, `JPY` 등 (기본값: USD) |
| `CTX_AREA_FK200` | X | String | 연속조회검색조건200 | 연속조회 시 사용 |
| `CTX_AREA_NK200` | X | String | 연속조회키200 | 연속조회 시 사용 |

##### 응답 (Response)

**주요 필드**:
- `output1`: 보유 종목별 상세 (종목코드, 보유수량, 매입평균가, 현재가, 평가손익)
- `output2`: 계좌 전체 요약 (총매입금액, 총평가금액, 총손익, 수익률)

---

#### /api/korea-invest/profit
- **설명**: 해외주식 기간손익 조회 API
- **참조**: https://apiportal.koreainvestment.com/apiservice/apiservice-overseas-stock
- **원본 API**: `/uapi/overseas-stock/v1/trading/inquire-period-profit`
- **TR ID**: `TTTS3039R`
- **Method**: GET
- **도메인**: https://openapi.koreainvestment.com:9443

##### 요청 (Request)

**Headers**: bunbong과 동일 (tr_id만 `TTTS3039R`)

**Query Parameters**
| 파라미터 | 필수 | 타입 | 설명 | 예시 |
|----------|------|------|------|------|
| `accountId` | O | Number | 계좌 ID | `7` |
| `CANO` | X | String | 종합계좌번호 | (선택) 자동 주입됨 |
| `ACNT_PRDT_CD` | X | String | 계좌상품코드 | (선택) 자동 주입됨 |
| `START_DATE` | O | String | 조회시작일자 | `YYYYMMDD` 형식 |
| `END_DATE` | O | String | 조회종료일자 | `YYYYMMDD` 형식 |
| `EXCD` | X | String | 해외거래소코드 | `NASD` 등 (기본값: NASD) |
| `NATN_CD` | X | String | 국가코드 | `840` (미국) 등 (기본값: 840) |
| `CURRENCY` | X | String | 거래통화코드 | `USD` 등 (기본값: USD) |
| `CURRENCY_TYPE` | X | String | 원화외화구분코드 | `01` (원화), `02` (외화) (기본값: 02) |
| `CTX_AREA_FK200` | X | String | 연속조회검색조건200 | 연속조회 시 사용 |
| `CTX_AREA_NK200` | X | String | 연속조회키200 | 연속조회 시 사용 |

**국가코드**: `840` (미국), `344` (홍콩), `156` (중국), `392` (일본), `704` (베트남)

##### 응답 (Response)

**주요 필드**:
- `output1`: 종목별 기간 손익 (종목코드, 매수/매도 수량/금액, 실현손익, 수익률)
- `output2`: 기간 전체 요약 (총매수/매도금액, 총실현손익, 수익률, 수수료)
---

### TOSE 증권

#### /api/tossinvest/community/[tickers]
- **설명**: 토스증권 커뮤니티 글 조회 (내부적으로 2단계 호출 필요)
- **참조**: `app/api/newsCommunity/route.ts`

##### 1단계: 종목 코드 검색
- **URL**: `https://wts-cert-api.tossinvest.com/api/v3/search-all/wts-auto-complete`
- **Method**: POST
- **Body**:
```json
{
  "query": "AAPL",
  "sections": [
    { "type": "PRODUCT", "option": { "addIntegratedSearchResult": true } }
  ]
}
```
- **응답 처리**: `result.data.items[0].productCode` 추출 (예: `us_AAPL`)

##### 2단계: 커뮤니티 글 조회
- **URL**: `https://wts-cert-api.tossinvest.com/api/v3/comments`
- **Method**: POST
- **Body**:
```json
{
  "subjectId": "us_AAPL",  // 1단계에서 구한 productCode
  "subjectType": "STOCK",
  "commentSortType": "RECENT"
}
```

##### 응답 데이터 구조 (공통 포맷)
```json
[
  {
    "id": "12345",
    "contents": "게시글 내용입니다.",
    "createdAt": "2023-11-27T12:00:00",
    "writer": {
      "name": "사용자닉네임",
      "img": "https://..."
    },
    "stats": {
      "likes": 10,
      "comments": 5,
      "views": null
    },
    "source": "toss"
  }
]
```

### Naver Finance

#### /api/naverfinance/community/[tickers]
- **설명**: 네이버 증권 해외주식 종목토론실 크롤링
- **원본 URL**: `https://finance.naver.com/world/board/investinfo.naver?code=[TICKER]`
- **방식**: 직접적인 API가 없으므로 위 URL을 크롤링하여 데이터 추출

##### 요청 (Request)
- **Method**: GET
- **URL**: `/api/naverfinance/community/AAPL`

##### 내부 처리 로직
1. `https://finance.naver.com/world/board/investinfo.naver?code=AAPL` 요청
2. HTML 응답 파싱 (cheerio 등 사용)
3. 게시글 목록 추출 및 공통 포맷으로 변환

##### 응답 데이터 구조 (공통 포맷)
```json
[
  {
    "id": "게시글번호",
    "contents": "게시글 제목",
    "createdAt": "2023.11.27",
    "writer": {
      "name": "작성자ID",
      "img": null
    },
    "stats": {
      "likes": 0,
      "comments": 0,
      "views": 100
    },
    "source": "naver",
    "url": "https://finance.naver.com/..." // 게시글 상세 링크
  }
]
```

### System

#### /api/openapi
- **설명**: 현재 API 명세서(`GEMINI.md`) 내용을 반환
- **Method**: GET
- **응답 데이터 구조**:
```json
{
  "title": "PotatoInvest API Documentation",
  "description": "API specification based on GEMINI.md",
  "content": "# API ..." // 마크다운 원본 내용
}
```
