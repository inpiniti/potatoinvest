import { NextResponse } from 'next/server';

const openapi = {
  openapi: '3.0.1',
  info: {
    title: 'PotatoInvest API',
    description:
      'PotatoInvest 내부 API를 위한 자동 생성된 최소 OpenAPI 명세입니다. 필요에 따라 경로를 추가/확장하세요.',
    version: '0.1.0',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/hello': {
      get: {
        summary: '시장 데이터 크롤링 및 분석',
        parameters: [
          {
            name: 'country',
            in: 'query',
            schema: { type: 'string' },
            description: '국가 코드 (기본값 us)',
          },
          {
            name: 'predictions',
            in: 'query',
            schema: { type: 'boolean' },
            description: '서버 측 예측 활성화 (기본값 true)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
            description: '대용량 응답에 대한 미리보기 제한 (선택 사항)',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer' },
            description: '대용량 응답에 대한 미리보기 오프셋 (선택 사항)',
          },
        ],
        responses: {
          '200': {
            description: '분석된 상품 배열 또는 페이지네이션된 { total, offset, limit, data }'
          },
        },
      },
    },
    '/api/dataroma/base': {
      get: {
        summary: 'Dataroma 기본 포트폴리오 (투자자 / 주식)',
        responses: { '200': { description: 'Dataroma 기본 데이터' } },
      },
    },
    '/api/newsCommunity': {
      get: {
        summary: '쿼리에 대한 토스증권 커뮤니티 댓글 가져오기',
        parameters: [
          {
            name: 'query',
            in: 'query',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: { '200': { description: '댓글 + 상품 코드' } },
      },
    },
    '/api/accounts': {
      get: {
        summary: '사용자 계좌 목록 조회',
        responses: { '200': { description: '계좌 배열' } },
      },
      post: {
        summary: '계좌 생성 (보호됨)',
        responses: { '200': { description: '성공' } },
      },
    },
    '/api/accounts/login': {
      post: {
        summary: '계좌 액세스 토큰 발급 (보호됨)',
        responses: { '200': { description: '토큰 데이터' } },
      },
    },
    '/api/accounts/settings': {
      patch: {
        summary: '계좌 설정 업데이트 (최대 포지션, 현금 비율)',
        responses: { '200': { description: '성공' } },
      },
    },
    '/api/accounts/presentBalance': {
      post: {
        summary: '계좌의 현재 잔고 / 보유 종목 조회',
        responses: {
          '200': {
            description: '현재 잔고 출력 (보유 종목 + 자산 요약)',
          },
        },
      },
    },
    '/api/dataroma/person': {
      get: {
        summary: 'Dataroma - 투자자 목록 (별칭)',
        responses: { '200': { description: '투자자 목록' } },
      },
    },
    '/api/dataroma/stock': {
      get: {
        summary: 'Dataroma - 주식 목록',
        responses: { '200': { description: '주식 목록' } },
      },
    },
    '/api/gemini': {
      get: {
        summary: 'Gemini 엔드포인트 (다양함)',
        responses: { '200': { description: 'Gemini API 응답' } },
      },
    },
    '/api/gemini/orders': {
      get: {
        summary: 'Gemini 주문 가져오기',
        responses: { '200': { description: '주문' } },
      },
    },
    '/api/yahoo': {
      get: {
        summary: 'Yahoo Finance 프록시',
        responses: { '200': { description: 'Yahoo 결과' } },
      },
    },
    '/api/detail': {
      get: {
        summary: '일반 상세 엔드포인트',
        responses: { '200': { description: '상세 정보' } },
      },
    },
    '/api/exchangeRate': {
      get: {
        summary: '환율 조회',
        responses: { '200': { description: '환율' } },
      },
      post: {
        summary: '환율 (POST)',
        responses: { '200': { description: '환율' } },
      },
    },
    '/api/newsCommunity/search': {
      get: {
        summary: '커뮤니티 뉴스 검색',
        responses: { '200': { description: '검색 결과' } },
      },
    },
    '/api/overseas/price': {
      get: {
        summary: '해외 시세 목록',
        responses: { '200': { description: '시세 데이터' } },
      },
    },
    '/api/overseas/price-detail': {
      get: {
        summary: '해외 시세 상세',
        responses: { '200': { description: '시세 상세' } },
      },
    },
    '/api/overseas/ohlc': {
      get: {
        summary: '해외 시장 OHLC 데이터',
        responses: { '200': { description: 'OHLC' } },
      },
    },
    '/api/koreainvestment/stock-search': {
      get: {
        summary: '한국투자증권 주식 검색',
        responses: { '200': { description: '검색 결과' } },
      },
    },
    '/api/koreainvestment/price': {
      get: {
        summary: '한국투자증권 시세 엔드포인트',
        responses: { '200': { description: '시세' } },
      },
    },
    '/api/koreainvestment/order': {
      post: {
        summary: '한국투자증권 주문 엔드포인트',
        responses: { '200': { description: '주문 결과' } },
      },
    },
    '/api/openapi': {
      get: {
        summary: 'OpenAPI JSON (이 파일)',
        responses: { '200': { description: 'OpenAPI JSON' } },
      },
    },
    '/api/dataroma/base/person': {
      get: {
        summary: 'Dataroma - 인물',
        responses: { '200': { description: '인물' } },
      },
    },
    '/api/dataroma/base/stock': {
      get: {
        summary: 'Dataroma - 주식',
        responses: { '200': { description: '주식' } },
      },
    },
    '/api/news': {
      get: {
        summary: '뉴스 애그리게이터',
        responses: { '200': { description: '뉴스 항목' } },
      },
    },
    '/api/detail/financials': {
      get: {
        summary: '기업 재무 상세',
        responses: { '200': { description: '재무 정보' } },
      },
    },
    '/api/recommend': {
      get: {
        summary: '추천 엔진 결과',
        responses: { '200': { description: '추천' } },
      },
    },
    '/api/test': {
      get: {
        summary: '테스트 엔드포인트 (다양함)',
        responses: { '200': { description: '테스트 응답' } },
      },
    },
    '/api/hello/predict': {
      post: {
        summary: 'hello 데이터에 대한 서버 측 예측 트리거',
        responses: { '200': { description: '예측 결과' } },
      },
    },
    '/api/ai/models': {
      get: {
        summary: '사용 가능한 AI 모델 목록 (서버 측)',
        responses: { '200': { description: '모델' } },
      },
    },
    '/api/ai/predict': {
      post: {
        summary: 'AI 예측 실행',
        responses: { '200': { description: '예측 결과' } },
      },
    },
    '/api/accounts/delete': {
      delete: {
        summary: '계좌 삭제',
        responses: { '200': { description: '성공' } },
      },
    },
    '/api/accounts/add': {
      post: {
        summary: '계좌 추가 (별칭, apiKey, apiSecret)',
        responses: { '200': { description: '성공' } },
      },
    },
    '/api/quotations': {
      get: {
        summary: '실시간 호가 프록시',
        responses: { '200': { description: '호가' } },
      },
    },
    '/api/presentBalance': {
      post: {
        summary: '현재 잔고 조회 별칭',
        responses: { '200': { description: '현재 잔고' } },
      },
    },
    '/api/dataroma/export': {
      get: {
        summary: 'Dataroma 데이터 내보내기 (csv/json)',
        responses: { '200': { description: '내보내기 파일 또는 JSON' } },
      },
    },
    '/api/newsCommunity/latest': {
      get: {
        summary: '최신 커뮤니티 게시물',
        responses: { '200': { description: '게시물' } },
      },
    },
    '/api/portfolio': {
      get: {
        summary: '사용자 포트폴리오 요약',
        responses: { '200': { description: '포트폴리오 요약' } },
      },
    },
    '/api/stock/detail': {
      get: {
        summary: '주식 상세 프록시',
        responses: { '200': { description: '주식 상세' } },
      },
    },
    '/api/hello/health': {
      get: {
        summary: 'hello 엔드포인트 헬스 체크',
        responses: { '200': { description: '성공' } },
      },
    },
    '/api/gemini/price': {
      get: {
        summary: 'Gemini 시세 피드',
        responses: { '200': { description: '시세' } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapi, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
    },
  });
}
