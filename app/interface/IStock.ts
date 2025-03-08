export default interface IStock {
  name: string; // 주식 이름
  description?: string; // 주식 설명
  logoid?: string; // 로고 ID
  update_mode?: string; // 업데이트 모드
  type?: string; // 주식 유형
  close?: number; // 종가
  pricescale?: number; // 가격 스케일
  minmov?: number; // 최소 이동
  fractional?: string; // 분수
  minmove2?: number; // 최소 이동 2
  currency?: string; // 통화
  change?: number; // 변화량
  volume: number; // 거래량
  relative_volume_10d_calc?: number; // 10일 상대 거래량 계산
  market_cap_basic?: number; // 기본 시가 총액
  fundamental_currency_code?: string; // 기본 통화 코드
  price_earnings_ttm?: number; // 주가 수익률 (TTM)
  earnings_per_share_diluted_ttm?: number; // 주당 순이익 희석 (TTM)
  earnings_per_share_diluted_yoy_growth_ttm?: number; // 주당 순이익 희석 연간 성장률 (TTM)
  dividends_yield_current?: number; // 현재 배당 수익률
  sector_tr?: string; // 섹터 (TR)
  market?: string; // 시장
  sector?: string; // 섹터
  recommendation_mark?: number; // 추천 점수
  exchange?: string; // 거래소
  perf_w?: number; // 주간 성과
  perf_1_m?: number; // 1개월 성과
  perf_3_m?: number; // 3개월 성과
  perf_6_m?: number; // 6개월 성과
  perf_y_t_d?: number; // 연초 대비 성과
  perf_y?: number; // 연간 성과
  perf_5_y?: number; // 5년 성과
  perf_10_y?: number; // 10년 성과
  perf_all?: number; // 전체 성과
  volatility_w?: number; // 주간 변동성
  volatility_m?: number; // 월간 변동성
  premarket_close?: number; // 프리마켓 종가
  premarket_change?: number; // 프리마켓 변화량
  premarket_gap?: number; // 프리마켓 갭
  premarket_volume?: number; // 프리마켓 거래량
  gap?: number; // 갭
  volume_change?: number; // 거래량 변화
  postmarket_close?: number; // 포스트마켓 종가
  postmarket_change?: number; // 포스트마켓 변화량
  postmarket_volume?: number; // 포스트마켓 거래량
  perf_1_y_market_cap?: number; // 1년 시가 총액 성과
  price_earnings_growth_ttm?: number; // 주가 수익 성장률 (TTM)
  price_sales_current?: number; // 현재 주가 매출 비율
  price_book_fq?: number; // 주가 장부가 비율 (FQ)
  price_to_cash_f_operating_activities_ttm?: number; // 주가 현금 비율 (운영 활동) (TTM)
  price_free_cash_flow_ttm?: number; // 주가 자유 현금 흐름 비율 (TTM)
  price_to_cash_ratio?: number; // 주가 현금 비율
  enterprise_value_current?: number; // 현재 기업 가치
  enterprise_value_to_revenue_ttm?: number; // 기업 가치 대비 매출 비율 (TTM)
  enterprise_value_to_ebit_ttm?: number; // 기업 가치 대비 EBIT 비율 (TTM)
  enterprise_value_ebitda_ttm?: number; // 기업 가치 대비 EBITDA 비율 (TTM)
  dps_common_stock_prim_issue_fy?: number; // 주당 배당금 (기본 주식) (FY)
  dps_common_stock_prim_issue_fq?: number; // 주당 배당금 (기본 주식) (FQ)
  dividends_yield?: number; // 배당 수익률
  dividend_payout_ratio_ttm?: number; // 배당 지급 비율 (TTM)
  dps_common_stock_prim_issue_yoy_growth_fy?: number; // 주당 배당금 연간 성장률 (기본 주식) (FY)
  continuous_dividend_payout?: number; // 연속 배당 지급
  continuous_dividend_growth?: number; // 연속 배당 성장
  gross_margin_ttm?: number; // 매출 총이익률 (TTM)
  operating_margin_ttm?: number; // 영업 이익률 (TTM)
  pre_tax_margin_ttm?: number; // 세전 이익률 (TTM)
  net_margin_ttm?: number; // 순이익률 (TTM)
  free_cash_flow_margin_ttm?: number; // 자유 현금 흐름 마진 (TTM)
  return_on_assets_fq?: number; // 자산 수익률 (FQ)
  return_on_equity_fq?: number; // 자기 자본 수익률 (FQ)
  return_on_invested_capital_fq?: number; // 투자 자본 수익률 (FQ)
  research_and_dev_ratio_ttm?: number; // 연구 개발 비율 (TTM)
  sell_gen_admin_exp_other_ratio_ttm?: number; // 판매, 일반 및 관리 비용 비율 (TTM)
  total_assets_fq?: number; // 총 자산 (FQ)
  total_current_assets_fq?: number; // 총 유동 자산 (FQ)
  cash_n_short_term_invest_fq?: number; // 현금 및 단기 투자 (FQ)
  total_liabilities_fq?: number; // 총 부채 (FQ)
  total_debt_fq?: number; // 총 부채 (FQ)
  net_debt_fq?: number; // 순 부채 (FQ)
  total_equity_fq?: number; // 총 자기 자본 (FQ)
  current_ratio_fq?: number; // 유동 비율 (FQ)
  quick_ratio_fq?: number; // 당좌 비율 (FQ)
  debt_to_equity_fq?: number; // 부채 비율 (FQ)
  cash_n_short_term_invest_to_total_debt_fq?: number; // 현금 및 단기 투자 대비 총 부채 비율 (FQ)
  cash_f_operating_activities_ttm?: number; // 운영 활동 현금 흐름 (TTM)
  cash_f_investing_activities_ttm?: number; // 투자 활동 현금 흐름 (TTM)
  cash_f_financing_activities_ttm?: number; // 재무 활동 현금 흐름 (TTM)
  free_cash_flow_ttm?: number; // 자유 현금 흐름 (TTM)
  capital_expenditures_ttm?: number; // 자본 지출 (TTM)
  recommend_all?: number; // 전체 추천
  recommend_m_a?: number; // M&A 추천
  recommend_other?: number; // 기타 추천
  r_s_i?: number; // RSI (상대 강도 지수)
  mom?: number; // 모멘텀
  a_o?: number; // AO (Awesome Oscillator)
  c_c_i20?: number; // CCI (20일)
  stoch_k?: number; // 스토캐스틱 K
  stoch_d?: number; // 스토캐스틱 D
}
