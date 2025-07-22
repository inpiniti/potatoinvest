/**
 * 주식 지표 분석 및 점수화 시스템 (6가지 지표 평가)
 */

// 6가지 지표별 평가 기준
const INDICATOR_EVALUATIONS = {
  // 1. 손익계산 평가
  손익계산평가: {
    매출성장률: {
      지표명: "total_revenue_yoy_growth_ttm",
      한글명: "매출 성장률 %",
      단계별범위: {
        매우부정적: { min: -Infinity, max: -20, score: 0 },
        부정적: { min: -20, max: 0, score: 1 },
        적정: { min: 0, max: 15, score: 3 },
        양호: { min: 15, max: 30, score: 4 },
        매우우수: { min: 30, max: Infinity, score: 5 },
      },
    },
    EPS희석성장: {
      지표명: "earnings_per_share_diluted_yoy_growth_ttm",
      한글명: "희석 주당순이익 성장률 %",
      단계별범위: {
        매우부정적: { min: -Infinity, max: -50, score: 0 },
        부정적: { min: -50, max: 0, score: 1 },
        적정: { min: 0, max: 25, score: 3 },
        양호: { min: 25, max: 50, score: 4 },
        매우우수: { min: 50, max: Infinity, score: 5 },
      },
    },
  },

  // 2. 수익성 지표 평가
  수익성지표평가: {
    총마진: {
      지표명: "gross_margin_ttm",
      한글명: "총마진%",
      단계별범위: {
        매우낮음: { min: -Infinity, max: 0, score: 0 },
        낮음: { min: 0, max: 20, score: 1 },
        적정: { min: 20, max: 40, score: 3 },
        양호: { min: 40, max: 60, score: 4 },
        매우우수: { min: 60, max: Infinity, score: 5 },
      },
    },
    영업마진: {
      지표명: "operating_margin_ttm",
      한글명: "영업마진%",
      단계별범위: {
        매우낮음: { min: -Infinity, max: 0, score: 0 },
        낮음: { min: 0, max: 5, score: 1 },
        적정: { min: 5, max: 15, score: 3 },
        양호: { min: 15, max: 25, score: 4 },
        매우우수: { min: 25, max: Infinity, score: 5 },
      },
    },
    ROA: {
      지표명: "return_on_assets_fq",
      한글명: "총자산 이익률 %",
      단계별범위: {
        매우낮음: { min: -Infinity, max: 0, score: 0 },
        낮음: { min: 0, max: 5, score: 1 },
        적정: { min: 5, max: 10, score: 3 },
        양호: { min: 10, max: 20, score: 4 },
        매우우수: { min: 20, max: Infinity, score: 5 },
      },
    },
    ROE: {
      지표명: "return_on_equity_fq",
      한글명: "자기자본 수익률 %",
      단계별범위: {
        매우낮음: { min: -Infinity, max: 0, score: 0 },
        낮음: { min: 0, max: 8, score: 1 },
        적정: { min: 8, max: 15, score: 3 },
        양호: { min: 15, max: 25, score: 4 },
        매우우수: { min: 25, max: Infinity, score: 5 },
      },
    },
  },

  // 3. 배당 지표 평가
  배당지표평가: {
    연속배당지급: {
      지표명: "continuous_dividend_payout",
      한글명: "지속적인 배당금 지급 (년)",
      단계별범위: {
        매우낮음: { min: 0, max: 2, score: 0 },
        낮음: { min: 3, max: 5, score: 1 },
        적정: { min: 6, max: 10, score: 3 },
        양호: { min: 11, max: 15, score: 4 },
        매우우수: { min: 16, max: Infinity, score: 5 },
      },
    },
    연속배당증가: {
      지표명: "continuous_dividend_growth",
      한글명: "지속적인 배당금 증가 (년)",
      단계별범위: {
        매우낮음: { min: 0, max: 2, score: 0 },
        낮음: { min: 3, max: 5, score: 1 },
        적정: { min: 6, max: 10, score: 3 },
        양호: { min: 11, max: 15, score: 4 },
        매우우수: { min: 16, max: Infinity, score: 5 },
      },
    },
    배당수익률: {
      지표명: "dividends_yield_current",
      한글명: "현재 배당 수익률 %",
      단계별범위: {
        매우낮음: { min: 0, max: 1, score: 1 },
        낮음: { min: 1, max: 2, score: 2 },
        적정: { min: 2, max: 4, score: 3 },
        양호: { min: 4, max: 7, score: 5 },
        매우높음: { min: 7, max: Infinity, score: 2 },
      },
    },
  },

  // 4. 대차대조표 평가
  대차대조표평가: {
    유동비율: {
      지표명: "current_ratio_fq",
      한글명: "유동비율",
      단계별범위: {
        매우위험: { min: -Infinity, max: 1.0, score: 0 },
        위험: { min: 1.0, max: 1.5, score: 1 },
        적정: { min: 1.5, max: 2.5, score: 3 },
        양호: { min: 2.5, max: 4.0, score: 4 },
        매우우수: { min: 4.0, max: Infinity, score: 5 },
      },
    },
    부채비율: {
      지표명: "debt_to_equity_fq",
      한글명: "부채 대 자본 비율",
      단계별범위: {
        매우우수: { min: -Infinity, max: 0.3, score: 5 },
        양호: { min: 0.3, max: 0.6, score: 4 },
        적정: { min: 0.6, max: 1.0, score: 3 },
        위험: { min: 1.0, max: 2.0, score: 1 },
        매우위험: { min: 2.0, max: Infinity, score: 0 },
      },
    },
  },

  // 5. 기술등급 평가
  기술등급평가: {
    기술등급: {
      지표명: "Recommend.All",
      한글명: "테크니컬 레이팅",
      단계별범위: {
        적극매도: { min: -Infinity, max: -0.4, score: 0 },
        매도: { min: -0.4, max: -0.15, score: 1 },
        중립: { min: -0.15, max: 0.15, score: 2.5 },
        매수: { min: 0.15, max: 0.4, score: 4 },
        적극매수: { min: 0.4, max: Infinity, score: 5 },
      },
    },
    MA레이팅: {
      지표명: "Recommend.MA",
      한글명: "무빙 애버리지 레이팅",
      단계별범위: {
        적극매도: { min: -Infinity, max: -0.4, score: 0 },
        매도: { min: -0.4, max: -0.15, score: 1 },
        중립: { min: -0.15, max: 0.15, score: 2.5 },
        매수: { min: 0.15, max: 0.4, score: 4 },
        적극매수: { min: 0.4, max: Infinity, score: 5 },
      },
    },
  },

  // 6. 평가 지표 평가 (밸류에이션)
  평가지표평가: {
    주가수익비율: {
      지표명: "price_earnings_ttm",
      한글명: "P/E 비율",
      단계별범위: {
        매우우수: { min: -Infinity, max: 10, score: 5 },
        우수: { min: 10, max: 15, score: 4 },
        적정: { min: 15, max: 40, score: 3 },
        높음: { min: 40, max: 60, score: 1 },
        매우높음: { min: 60, max: Infinity, score: 0 },
      },
    },
    주가수익성장률: {
      지표명: "price_earnings_growth_ttm",
      한글명: "PEG 비율",
      단계별범위: {
        매우우수: { min: -Infinity, max: 0.5, score: 5 },
        우수: { min: 0.5, max: 1.0, score: 4 },
        적정: { min: 1.0, max: 2.0, score: 3 },
        위험: { min: 2.0, max: 3.0, score: 1 },
        매우위험: { min: 3.0, max: Infinity, score: 0 },
      },
    },
    주가매출비율: {
      지표명: "price_sales_current",
      한글명: "P/S 비율",
      단계별범위: {
        매우우수: { min: -Infinity, max: 1, score: 5 },
        우수: { min: 1, max: 2, score: 4 },
        적정: { min: 2, max: 7, score: 3 },
        위험: { min: 7, max: 15, score: 1 },
        매우위험: { min: 15, max: Infinity, score: 0 },
      },
    },
  },
};

// 지표별 해석 메시지
const SCORE_INTERPRETATIONS = {
  지표별해석: {
    손익계산평가: {
      5: "손익계산서 지표들이 매우 우수합니다! 탁월한 성장성을 보이고 있어요 🚀",
      4: "손익계산서 지표들이 양호합니다! 좋은 성장 추세를 보이고 있어요 👍",
      3: "손익계산서 지표들이 적정 수준입니다. 안정적인 성과를 유지하고 있어요 😊",
      2: "손익계산서 지표들이 다소 아쉽습니다. 개선이 필요해 보여요 😕",
      1: "손익계산서 지표들이 부정적입니다. 주의가 필요한 상황이에요 😰",
      0: "손익계산서 지표들이 매우 부정적입니다. 신중한 접근이 필요해요 🚨",
    },
    수익성지표평가: {
      5: "수익성 지표들이 매우 우수합니다! 탁월한 수익 창출 능력을 보여줘요 🚀",
      4: "수익성 지표들이 양호합니다! 효율적인 수익 구조를 가지고 있어요 👍",
      3: "수익성 지표들이 적정 수준입니다. 안정적인 수익성을 유지하고 있어요 😊",
      2: "수익성 지표들이 다소 아쉽습니다. 수익성 개선이 필요해 보여요 😕",
      1: "수익성 지표들이 낮습니다. 수익 구조 점검이 필요한 상황이에요 😰",
      0: "수익성 지표들이 매우 낮습니다. 수익성 개선이 시급해요 🚨",
    },
    배당지표평가: {
      5: "배당 지표들이 매우 우수합니다! 훌륭한 배당주로 평가됩니다 💎",
      4: "배당 지표들이 양호합니다! 안정적인 배당 정책을 보여줘요 👍",
      3: "배당 지표들이 적정 수준입니다. 기본적인 배당 매력도가 있어요 😊",
      2: "배당 지표들이 다소 아쉽습니다. 배당 정책을 지켜봐야겠어요 😕",
      1: "배당 지표들이 부족합니다. 배당 투자로는 한계가 있어 보여요 😰",
      0: "배당 지표들이 매우 부족합니다. 배당 투자 매력도가 낮아요 🚨",
    },
    대차대조표평가: {
      5: "재무 안정성이 매우 우수합니다! 탁월한 재무 건전성을 보여줘요 💎",
      4: "재무 안정성이 양호합니다! 건전한 재무 구조를 가지고 있어요 👍",
      3: "재무 안정성이 적정 수준입니다. 안정적인 재무 상태를 유지해요 😊",
      2: "재무 안정성이 다소 우려됩니다. 재무 관리에 주의가 필요해요 😕",
      1: "재무 안정성이 위험합니다. 재무 구조 개선이 필요한 상황이에요 😰",
      0: "재무 안정성이 매우 위험합니다. 재무 위험이 매우 높아요 🚨",
    },
    기술등급평가: {
      5: "기술적 분석 신호가 매우 긍정적입니다! 강력한 매수 신호예요 🚀",
      4: "기술적 분석 신호가 긍정적입니다! 매수를 고려해볼만 해요 👍",
      3: "기술적 분석 신호가 중립적입니다. 추가 신호를 기다려보세요 😊",
      2: "기술적 분석 신호가 다소 부정적입니다. 신중한 접근이 필요해요 😕",
      1: "기술적 분석 신호가 부정적입니다. 주의가 필요한 상황이에요 😰",
      0: "기술적 분석 신호가 매우 부정적입니다. 매도를 고려해보세요 🚨",
    },
    평가지표평가: {
      5: "밸류에이션이 매우 매력적입니다! 뛰어난 투자 기회로 보입니다 🚀",
      4: "밸류에이션이 매력적입니다! 저평가된 상황으로 판단됩니다 👍",
      3: "밸류에이션이 적정 수준입니다. 공정한 가치로 평가되고 있어요 😊",
      2: "밸류에이션이 다소 높습니다. 고평가 우려가 있어 보여요 😕",
      1: "밸류에이션이 높습니다. 고평가 상태로 주의가 필요해요 😰",
      0: "밸류에이션이 매우 높습니다. 고평가 위험이 매우 커요 🚨",
    },
  },
  종합해석: {
    5: "전체적으로 매우 우수한 투자처입니다! 모든 면에서 탁월한 성과를 보여줍니다 🌟",
    4: "전체적으로 우수한 투자처입니다! 대부분의 지표가 양호한 수준이에요 🚀",
    3: "전체적으로 적정한 투자처입니다. 안정적이고 균형잡힌 모습을 보여줘요 😊",
    2: "전체적으로 다소 아쉬운 투자처입니다. 일부 개선이 필요해 보여요 😕",
    1: "전체적으로 부족한 투자처입니다. 여러 지표에서 주의가 필요한 상황이에요 😰",
    0: "전체적으로 위험한 투자처입니다. 신중한 검토가 반드시 필요해요 🚨",
  },
};

/**
 * 개별 지표의 점수 계산
 */
function calculateIndicatorScore(value, ranges) {
  if (value == null || value === undefined || isNaN(value)) {
    return {
      score: 0,
      grade: "데이터없음",
      interpretation: "데이터를 확인할 수 없습니다",
    };
  }

  for (const [grade, range] of Object.entries(ranges)) {
    if (value >= range.min && value < range.max) {
      return {
        score: parseFloat(range.score?.toFixed(2)),
        grade: grade,
        interpretation: getInterpretationByGrade(grade),
      };
    }
  }

  // 범위를 벗어나는 경우 가장 가까운 범위의 점수 사용
  const grades = Object.keys(ranges);
  const firstGrade = grades[0];
  const lastGrade = grades[grades.length - 1];

  if (value < ranges[firstGrade].min) {
    return {
      score: parseFloat(ranges[firstGrade].score?.toFixed(2)),
      grade: firstGrade,
      interpretation: getInterpretationByGrade(firstGrade),
    };
  } else {
    return {
      score: parseFloat(ranges[lastGrade].score?.toFixed(2)),
      grade: lastGrade,
      interpretation: getInterpretationByGrade(lastGrade),
    };
  }
}

/**
 * 등급별 해석 메시지 가져오기
 */
function getInterpretationByGrade(grade) {
  const interpretations = {
    매우우수: "매우 우수한 수준입니다! 🚀",
    적극매수: "적극적인 매수 신호입니다! 🚀",
    양호: "양호한 수준입니다! 👍",
    우수: "우수한 수준입니다! 👍",
    매수: "매수 신호입니다! 👍",
    적정: "적정한 수준입니다 😊",
    중립: "중립적인 상황입니다 😊",
    부정적: "다소 부정적입니다 😕",
    낮음: "낮은 수준입니다 😕",
    위험: "위험한 수준입니다 😕",
    매도: "매도 신호입니다 😕",
    높음: "높은 수준입니다 😕",
    매우부정적: "매우 부정적입니다 😰",
    매우낮음: "매우 낮은 수준입니다 😰",
    매우위험: "매우 위험합니다 😰",
    적극매도: "적극적인 매도 신호입니다 😰",
    매우높음: "매우 높은 수준입니다 🚨",
    데이터없음: "데이터를 확인할 수 없습니다 ❓",
  };

  return interpretations[grade] || "평가 불가 ❓";
}

/**
 * 점수를 기반으로 한 해석 메시지 가져오기
 */
function getInterpretationByScore(score, category = "종합해석") {
  const roundedScore = Math.round(score);
  const clampedScore = Math.max(0, Math.min(5, roundedScore));

  if (category === "종합해석") {
    return SCORE_INTERPRETATIONS.종합해석[clampedScore] || "평가 불가";
  } else {
    return (
      SCORE_INTERPRETATIONS.지표별해석[category]?.[clampedScore] || "평가 불가"
    );
  }
}

/**
 * 지표별 분석 수행
 */
function analyzeCategory(categoryName, indicators, stockData) {
  const results = {};
  const scores = [];

  Object.entries(indicators).forEach(([indicatorKey, config]) => {
    const value = stockData[config.지표명];
    const result = calculateIndicatorScore(value, config.단계별범위);

    results[indicatorKey] = {
      지표명: config.지표명,
      한글명: config.한글명,
      현재값: value,
      점수: result.score,
      등급: result.grade,
      해석: result.interpretation,
    };

    if (result.score > 0) {
      // 데이터가 있는 경우만 평균 계산에 포함
      scores.push(result.score);
    }
  });

  const averageScore =
    scores.length > 0
      ? parseFloat(
          (scores.reduce((a, b) => a + b, 0) / scores.length)?.toFixed(2)
        )
      : 0;

  return {
    지표들: results,
    평균점수: averageScore,
    해석: getInterpretationByScore(averageScore, categoryName),
    데이터개수: scores.length,
  };
}

/**
 * 종합 주식 분석
 */
function analyzeStock(stockData) {
  const analysis = {};
  const categoryScores = [];

  // 6가지 지표별 분석
  Object.entries(INDICATOR_EVALUATIONS).forEach(
    ([categoryName, indicators]) => {
      const categoryResult = analyzeCategory(
        categoryName,
        indicators,
        stockData
      );
      analysis[categoryName] = categoryResult;

      if (categoryResult.평균점수 > 0) {
        categoryScores.push(categoryResult.평균점수);
      }
    }
  );

  // 종합 점수 계산
  const totalScore =
    categoryScores.length > 0
      ? parseFloat(
          (
            categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
          )?.toFixed(2)
        )
      : 0;

  analysis.종합평가 = {
    총점수: totalScore,
    해석: getInterpretationByScore(totalScore),
    평가된지표수: categoryScores.length,
    지표별점수: Object.fromEntries(
      Object.entries(analysis).map(([key, value]) => [key, value.평균점수])
    ),
  };

  return analysis;
}

/**
 * 예시 사용법
 */
function exampleAnalysis() {
  const sampleStock = {
    // 손익계산 예시 데이터
    total_revenue_yoy_growth_ttm: 25.5,
    earnings_per_share_diluted_yoy_growth_ttm: 35.2,

    // 수익성 예시 데이터
    gross_margin_ttm: 45.3,
    operating_margin_ttm: 18.7,
    return_on_assets_fq: 12.4,
    return_on_equity_fq: 18.9,

    // 배당 예시 데이터
    continuous_dividend_payout: 12,
    continuous_dividend_growth: 8,
    dividends_yield_current: 3.2,

    // 대차대조표 예시 데이터
    current_ratio_fq: 2.1,
    debt_to_equity_fq: 0.45,

    // 기술등급 예시 데이터
    "Recommend.All": 0.25,
    "Recommend.MA": 0.15,

    // 평가지표 예시 데이터
    price_earnings_ttm: 22.5,
    price_earnings_growth_ttm: 1.3,
    price_sales_current: 3.2,
  };

  const result = analyzeStock(sampleStock);

  console.log("📊 종목 분석 결과:");
  console.log("=".repeat(50));

  // 각 지표별 결과 출력
  Object.entries(result).forEach(([categoryName, categoryData]) => {
    if (categoryName !== "종합평가") {
      console.log(`\n🎯 ${categoryName}:`);
      console.log(`   평균 점수: ${categoryData.평균점수}/5.00점`);
      console.log(`   해석: ${categoryData.해석}`);

      Object.entries(categoryData.지표들).forEach(([indicatorName, data]) => {
        console.log(
          `   - ${data.한글명}: ${data.현재값} → ${data.점수}/5.00점 (${data.등급})`
        );
      });
    }
  });

  // 종합 평가
  console.log("\n🌟 종합 평가:");
  console.log(`   총 점수: ${result.종합평가.총점수}/5.00점`);
  console.log(`   해석: ${result.종합평가.해석}`);
  console.log(`   평가된 지표수: ${result.종합평가.평가된지표수}개`);

  return result;
}

// 웹 워커에서 사용 시 전역으로 노출
if (typeof self !== "undefined" && typeof window === "undefined") {
  self.analyzeStock = analyzeStock;
  self.calculateIndicatorScore = calculateIndicatorScore;
  self.INDICATOR_EVALUATIONS = INDICATOR_EVALUATIONS;
}

// 모듈 내보내기
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_EVALUATIONS,
    SCORE_INTERPRETATIONS,
  };
}

// 브라우저에서 직접 실행 시
if (typeof window !== "undefined") {
  window.StockAnalyzer = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_EVALUATIONS,
    SCORE_INTERPRETATIONS,
  };
}

// 직접 실행 시 예시 출력
if (typeof require !== "undefined" && require.main === module) {
  exampleAnalysis();
}
