/**
 * S&P 500 기준 주식 지표 분석 및 점수화 시스템
 */

// S&P 500 지표 범위 기준값
const INDICATOR_RANGES = {
  dividend: {
    // 배당 관련 지표
    consecutiveDividend: { min: 0, max: 20, optimal: 'higher' },
    sustainedDividendGrowth: { min: 0, max: 19, optimal: 'higher' },
    dividendGrowthRate: { min: -100, max: 450, optimal: 'near_zero' },
    dividendMarginRatio: { min: -22146, max: 699.83, optimal: 'higher' },
    dividendYield: { min: 0, max: 9.8, optimal: 'moderate' }, // 4-7% 적정
  },

  cashFlow: {
    // 현금흐름 분석
    capex: { min: -133.09, max: 0, optimal: 'moderate_negative' },
    fcf: { min: -12.83, max: 98.44, optimal: 'higher' },
    financingCashFlow: { min: -129.34, max: 51.17, optimal: 'higher' },
    investmentCashFlow: {
      min: -106.2,
      max: 144.03,
      optimal: 'context_dependent',
    },
    operatingCashFlow: { min: -10.33, max: 132.6, optimal: 'higher' },
  },

  profitability: {
    // 수익성 분석
    revenueGrowth: { min: -44.3, max: 91.52, optimal: 'higher' },
    grossProfit: { min: -1.41, max: 319.68, optimal: 'higher' },
    operatingProfit: { min: -10.16, max: 127.36, optimal: 'higher' },
    netIncome: { min: -19.2, max: 111, optimal: 'higher' },
    epsGrowth: { min: -25, max: 485.85, optimal: 'moderate_higher' },
    grossMargin: { min: -260, max: 99.69, optimal: 'higher' },
    operatingMargin: { min: -117, max: 90.0, optimal: 'higher' },
    netMargin: { min: -105, max: 76.0, optimal: 'higher' },
    roa: { min: -41, max: 75, optimal: 'higher' },
    roe: { min: -198, max: 1176, optimal: 'moderate_higher' },
  },

  technical: {
    // 테크니컬 지표
    momentum: { min: -313, max: 74, optimal: 'context_dependent' },
    ao: { min: -213, max: 131, optimal: 'context_dependent' },
    cci: { min: -257, max: 306, optimal: 'context_dependent' },
  },
};

/**
 * 개별 지표 점수 계산 (0-5점)
 */
function calculateIndicatorScore(value, range) {
  const { min, max, optimal } = range;

  // 값이 범위를 벗어나는 경우 처리
  if (value < min) return 0;
  if (value > max) return optimal === 'higher' ? 5 : 0;

  // 정규화 (0-1)
  const normalized = (value - min) / (max - min);

  switch (optimal) {
    case 'higher':
      return normalized * 5;

    case 'lower':
      return (1 - normalized) * 5;

    case 'near_zero':
      // 0에 가까울수록 좋음
      const distance = Math.abs(value) / Math.max(Math.abs(min), Math.abs(max));
      return (1 - distance) * 5;

    case 'moderate':
      // 중간값이 좋음 (배당수익률 4-7% 기준)
      if (value >= 4 && value <= 7) return 5;
      if (value >= 3 && value <= 8) return 4;
      if (value >= 2 && value <= 9) return 3;
      return normalized * 2;

    case 'moderate_higher':
      // 적당히 높은 값이 좋음
      if (normalized > 0.8) return 4; // 너무 높으면 위험
      return normalized * 5;

    case 'moderate_negative':
      // 적당한 음수가 좋음 (CAPEX의 경우)
      return Math.min(5, (1 - Math.abs(normalized - 0.5) * 2) * 5);

    default:
      return 2.5; // 중립
  }
}

/**
 * 종목 종합 분석
 */
function analyzeStock(stockData) {
  const analysis = {
    dividend: {},
    cashFlow: {},
    profitability: {},
    technical: {},
    overall: {},
  };

  // 배당 지표 분석
  if (stockData.dividend) {
    const dividend = stockData.dividend;
    analysis.dividend = {
      consecutiveDividend: {
        value: dividend.consecutiveDividend,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.consecutiveDividend,
              INDICATOR_RANGES.dividend.consecutiveDividend
            ) * 100
          ) / 100,
        analysis:
          dividend.consecutiveDividend >= 15
            ? `와! ${dividend.consecutiveDividend}년 연속 배당을 줬네요! 정말 믿을 만한 회사예요 👍`
            : dividend.consecutiveDividend >= 10
            ? `${dividend.consecutiveDividend}년 동안 꾸준히 배당을 주고 있어요. 안정적인 회사라고 볼 수 있겠네요 😊`
            : `${dividend.consecutiveDividend}년간 배당을 줬는데, 아직 짧은 편이에요. 좀 더 지켜봐야 할 것 같아요 🤔`,
      },
      sustainedDividendGrowth: {
        value: dividend.sustainedDividendGrowth,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.sustainedDividendGrowth,
              INDICATOR_RANGES.dividend.sustainedDividendGrowth
            ) * 100
          ) / 100,
        analysis:
          dividend.sustainedDividendGrowth >= 15
            ? `${dividend.sustainedDividendGrowth}년간 배당을 계속 늘려왔어요! 정말 성장하는 회사네요 🚀`
            : `${dividend.sustainedDividendGrowth}년간 배당을 늘려왔어요. 꽤 괜찮은 성장세를 보이고 있어요 📈`,
      },
      dividendGrowthRate: {
        value: dividend.dividendGrowthRate,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dividendGrowthRate,
              INDICATOR_RANGES.dividend.dividendGrowthRate
            ) * 100
          ) / 100,
        analysis:
          Math.abs(dividend.dividendGrowthRate) <= 50
            ? `배당 증가율이 ${dividend.dividendGrowthRate}%로 안정적이에요. 무리하지 않고 꾸준히 늘리고 있네요 ✅`
            : dividend.dividendGrowthRate > 200
            ? `어? 배당이 ${dividend.dividendGrowthRate}%나 늘었네요! 너무 급격한 증가라 앞으로 유지될지 의문이에요 😰`
            : `배당 변화가 ${dividend.dividendGrowthRate}%로 좀 불안정해 보여요. 회사 상황을 더 살펴봐야겠어요 📊`,
      },
      dividendMarginRatio: {
        value: dividend.dividendMarginRatio,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dividendMarginRatio,
              INDICATOR_RANGES.dividend.dividendMarginRatio
            ) * 100
          ) / 100,
        analysis:
          dividend.dividendMarginRatio > 100
            ? `배당 여력이 ${dividend.dividendMarginRatio}%로 충분해요! 앞으로도 배당을 넉넉히 줄 수 있을 것 같아요 💰`
            : `배당 여력이 ${dividend.dividendMarginRatio}%인데, 보통 수준이에요. 나쁘지 않지만 아주 풍족하지는 않네요 🤷‍♂️`,
      },
      dividendYield: {
        value: dividend.dividendYield,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dividendYield,
              INDICATOR_RANGES.dividend.dividendYield
            ) * 100
          ) / 100,
        analysis:
          dividend.dividendYield >= 4 && dividend.dividendYield <= 7
            ? `배당수익률이 ${dividend.dividendYield}%예요! 딱 적당한 수준으로 괜찮네요 😄`
            : dividend.dividendYield > 8
            ? `배당수익률이 ${dividend.dividendYield}%로 높아요! 좋긴 한데... 혹시 회사에 문제가 있는 건 아닐까요? 🚨`
            : `배당수익률이 ${dividend.dividendYield}%로 좀 낮은 편이에요. 성장주라서 그런 걸 수도 있어요 📈`,
      },
    };

    // 배당 부문 평균 점수
    const dividendScores = Object.values(analysis.dividend).map(
      (item) => item.score
    );
    analysis.dividend.averageScore =
      Math.round(
        (dividendScores.reduce((a, b) => a + b, 0) / dividendScores.length) *
          100
      ) / 100;
  }

  // 전체 평균 점수 계산
  const allScores = [];
  Object.values(analysis).forEach((category) => {
    if (category.averageScore) {
      allScores.push(category.averageScore);
    }
  });

  analysis.overall = {
    totalScore:
      allScores.length > 0
        ? Math.round(
            (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100
          ) / 100
        : 0,
    rating: (function (score) {
      if (score >= 4.5) return 'A+ (투자하기 정말 좋은 회사! 🌟)';
      if (score >= 4.0) return 'A (투자할 만한 우수한 회사 👍)';
      if (score >= 3.5) return 'B+ (나쁘지 않은 괜찮은 회사 😊)';
      if (score >= 3.0) return 'B (그럭저럭 보통인 회사 😐)';
      if (score >= 2.0) return 'C (좀 위험할 수 있는 회사 ⚠️)';
      return 'D (투자하기엔 너무 위험한 회사 🚨)';
    })(
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0
    ),
    recommendation: (function (score) {
      if (score >= 4.0) return '사도 좋을 것 같아요! 💰';
      if (score >= 3.0) return '일단 지켜보거나 조금만 사는 게 어떨까요? 🤔';
      return '지금은 사지 않는 게 좋겠어요 😔';
    })(
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0
    ),
  };

  return analysis;
}

/**
 * 예시 사용법
 */
function exampleAnalysis() {
  const sampleStock = {
    dividend: {
      consecutiveDividend: 10,
      sustainedDividendGrowth: 18,
      dividendGrowthRate: 259,
      dividendMarginRatio: 188,
      dividendYield: 7,
    },
  };

  const result = analyzeStock(sampleStock);

  console.log(result);

  console.log('📊 종목 분석 결과:');
  console.log('='.repeat(50));

  // 배당 지표 출력
  if (result.dividend) {
    console.log('\n🏆 배당 지표 분석:');
    Object.entries(result.dividend).forEach(([key, data]) => {
      if (key !== 'averageScore') {
        console.log(
          `  ${key}: ${data.value} → ${data.score}/5점 (${data.analysis})`
        );
      }
    });
    console.log(`\n💰 배당 부문 평균: ${result.dividend.averageScore}/5점`);
  }

  // 종합 평가
  console.log('\n🎯 종합 평가:');
  console.log(`  총점: ${result.overall.totalScore}/5점`);
  console.log(`  등급: ${result.overall.rating}`);
  console.log(`  추천: ${result.overall.recommendation}`);

  return result;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_RANGES,
    exampleAnalysis,
  };
}

// 브라우저에서 직접 실행 시
if (typeof window !== 'undefined') {
  window.StockAnalyzer = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_RANGES,
    exampleAnalysis,
  };
}

// 직접 실행 시 예시 출력
if (require.main === module) {
  exampleAnalysis();
}
