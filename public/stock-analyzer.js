/**
 * S&P 500 기준 주식 지표 분석 및 점수화 시스템
 */

// S&P 500 지표 범위 기준값
const INDICATOR_RANGES = {
  dividend: {
    // 배당 관련 지표 - 실제 필드명 사용
    continuous_dividend_payout: { min: 0, max: 20, optimal: "higher" }, // 연속 배당 지급
    continuous_dividend_growth: { min: 0, max: 19, optimal: "higher" }, // 연속 배당 성장
    dps_common_stock_prim_issue_yoy_growth_fy: {
      min: -100,
      max: 450,
      optimal: "near_zero",
    }, // DPS 연간 성장률
    dividend_payout_ratio_ttm: { min: -22146, max: 699.83, optimal: "higher" }, // 배당 비율%(TTM)
    dividends_yield_current: { min: 0, max: 9.8, optimal: "moderate" }, // 배당 수익률% (4-7% 적정)
  },

  cashFlow: {
    // 현금흐름 분석 - 핵심 3대 지표 (절댓값 단위)
    cash_f_operating_activities_ttm: {
      min: -10330000000,
      max: 132600000000,
      optimal: "higher",
    }, // 영업활동 현금흐름 (영업계정흐름)
    cash_f_financing_activities_ttm: {
      min: -129340000000,
      max: 51170000000,
      optimal: "higher",
    }, // 재무활동 현금흐름 (재무현금흐름)
    free_cash_flow_ttm: {
      min: -12830000000,
      max: 98440000000,
      optimal: "higher",
    }, // 자유현금흐름 (FCF)
  },

  profitability: {
    // 수익성 분석
    revenueGrowth: { min: -44.3, max: 91.52, optimal: "higher" },
    grossProfit: { min: -1.41, max: 319.68, optimal: "higher" },
    operatingProfit: { min: -10.16, max: 127.36, optimal: "higher" },
    netIncome: { min: -19.2, max: 111, optimal: "higher" },
    epsGrowth: { min: -25, max: 485.85, optimal: "moderate_higher" },
    grossMargin: { min: -260, max: 99.69, optimal: "higher" },
    operatingMargin: { min: -117, max: 90.0, optimal: "higher" },
    netMargin: { min: -105, max: 76.0, optimal: "higher" },
    roa: { min: -41, max: 75, optimal: "higher" },
    roe: { min: -198, max: 1176, optimal: "moderate_higher" },
  },

  technical: {
    // 테크니컬 지표
    momentum: { min: -313, max: 74, optimal: "context_dependent" },
    ao: { min: -213, max: 131, optimal: "context_dependent" },
    cci: { min: -257, max: 306, optimal: "context_dependent" },
  },
};

/**
 * 개별 지표 점수 계산 (0-5점)
 */
function calculateIndicatorScore(value, range) {
  const { min, max, optimal } = range;

  // 값이 범위를 벗어나는 경우 처리
  if (value < min) return 0;
  if (value > max) return optimal === "higher" ? 5 : 0;

  // 정규화 (0-1)
  const normalized = (value - min) / (max - min);

  switch (optimal) {
    case "higher":
      return normalized * 5;

    case "lower":
      return (1 - normalized) * 5;

    case "near_zero":
      // 0에 가까울수록 좋음
      const distance = Math.abs(value) / Math.max(Math.abs(min), Math.abs(max));
      return (1 - distance) * 5;

    case "moderate":
      // 중간값이 좋음 (배당수익률 4-7% 기준)
      if (value >= 4 && value <= 7) return 5;
      if (value >= 3 && value <= 8) return 4;
      if (value >= 2 && value <= 9) return 3;
      return normalized * 2;

    case "moderate_higher":
      // 적당히 높은 값이 좋음
      if (normalized > 0.8) return 4; // 너무 높으면 위험
      return normalized * 5;

    case "moderate_negative":
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
      continuous_dividend_payout: {
        value: dividend.continuous_dividend_payout,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.continuous_dividend_payout,
              INDICATOR_RANGES.dividend.continuous_dividend_payout
            ) * 100
          ) / 100,
        analysis:
          dividend.continuous_dividend_payout >= 15
            ? `와! ${dividend.continuous_dividend_payout}년 연속 배당을 줬네요! 정말 믿을 만한 회사예요 👍`
            : dividend.continuous_dividend_payout >= 10
            ? `${dividend.continuous_dividend_payout}년 동안 꾸준히 배당을 주고 있어요. 안정적인 회사라고 볼 수 있겠네요 😊`
            : `${dividend.continuous_dividend_payout}년간 배당을 줬는데, 아직 짧은 편이에요. 좀 더 지켜봐야 할 것 같아요 🤔`,
      },
      continuous_dividend_growth: {
        value: dividend.continuous_dividend_growth,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.continuous_dividend_growth,
              INDICATOR_RANGES.dividend.continuous_dividend_growth
            ) * 100
          ) / 100,
        analysis:
          dividend.continuous_dividend_growth >= 15
            ? `${dividend.continuous_dividend_growth}년간 배당을 계속 늘려왔어요! 정말 성장하는 회사네요 🚀`
            : `${dividend.continuous_dividend_growth}년간 배당을 늘려왔어요. 꽤 괜찮은 성장세를 보이고 있어요 📈`,
      },
      dps_common_stock_prim_issue_yoy_growth_fy: {
        value: dividend.dps_common_stock_prim_issue_yoy_growth_fy,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dps_common_stock_prim_issue_yoy_growth_fy,
              INDICATOR_RANGES.dividend
                .dps_common_stock_prim_issue_yoy_growth_fy
            ) * 100
          ) / 100,
        analysis:
          Math.abs(dividend.dps_common_stock_prim_issue_yoy_growth_fy) <= 50
            ? `DPS 증가율이 ${dividend.dps_common_stock_prim_issue_yoy_growth_fy}%로 안정적이에요. 무리하지 않고 꾸준히 늘리고 있네요 ✅`
            : dividend.dps_common_stock_prim_issue_yoy_growth_fy > 200
            ? `어? DPS가 ${dividend.dps_common_stock_prim_issue_yoy_growth_fy}%나 늘었네요! 너무 급격한 증가라 앞으로 유지될지 의문이에요 😰`
            : `DPS 변화가 ${dividend.dps_common_stock_prim_issue_yoy_growth_fy}%로 좀 불안정해 보여요. 회사 상황을 더 살펴봐야겠어요 📊`,
      },
      dividend_payout_ratio_ttm: {
        value: dividend.dividend_payout_ratio_ttm,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dividend_payout_ratio_ttm,
              INDICATOR_RANGES.dividend.dividend_payout_ratio_ttm
            ) * 100
          ) / 100,
        analysis:
          dividend.dividend_payout_ratio_ttm > 100
            ? `배당 지급비율이 ${dividend.dividend_payout_ratio_ttm}%로 충분해요! 앞으로도 배당을 넉넉히 줄 수 있을 것 같아요 💰`
            : `배당 지급비율이 ${dividend.dividend_payout_ratio_ttm}%인데, 보통 수준이에요. 나쁘지 않지만 아주 풍족하지는 않네요 🤷‍♂️`,
      },
      dividends_yield_current: {
        value: dividend.dividends_yield_current,
        score:
          Math.round(
            calculateIndicatorScore(
              dividend.dividends_yield_current,
              INDICATOR_RANGES.dividend.dividends_yield_current
            ) * 100
          ) / 100,
        analysis:
          dividend.dividends_yield_current >= 4 &&
          dividend.dividends_yield_current <= 7
            ? `배당수익률이 ${dividend.dividends_yield_current}%예요! 딱 적당한 수준으로 괜찮네요 😄`
            : dividend.dividends_yield_current > 8
            ? `배당수익률이 ${dividend.dividends_yield_current}%로 높아요! 좋긴 한데... 혹시 회사에 문제가 있는 건 아닐까요? 🚨`
            : `배당수익률이 ${dividend.dividends_yield_current}%로 좀 낮은 편이에요. 성장주라서 그런 걸 수도 있어요 📈`,
      },
    };

    // 배당 부문 평균 점수
    const dividendScores = Object.values(analysis.dividend).map(
      (item) => item.score
    );
    const avgScore =
      Math.round(
        (dividendScores.reduce((a, b) => a + b, 0) / dividendScores.length) *
          100
      ) / 100;

    analysis.dividend.averageScore = avgScore;

    // 배당 부문 종합 의견 추가
    analysis.dividend.overallAnalysis = (function (score) {
      if (score >= 4.5) {
        return "🌟 와! 정말 훌륭한 배당주네요! 연속 배당, 성장성, 수익률 모든 면에서 완벽해요. 장기 투자하기 딱 좋은 회사예요!";
      } else if (score >= 4.0) {
        return "👍 아주 좋은 배당주예요! 대부분의 지표가 우수하고 안정적인 배당을 기대할 수 있어요. 포트폴리오에 추가하면 좋겠네요!";
      } else if (score >= 3.5) {
        return "😊 괜찮은 배당주네요! 몇 가지 아쉬운 부분이 있지만 전반적으로 나쁘지 않아요. 보수적인 투자자에게 적합할 것 같아요.";
      } else if (score >= 3.0) {
        return "😐 보통 수준의 배당주예요. 장점과 단점이 섞여있네요. 다른 투자 옵션과 비교해보시는 게 좋겠어요.";
      } else if (score >= 2.0) {
        return "⚠️ 배당 투자로는 좀 위험해 보여요. 배당 관련 지표들이 불안정하거나 낮은 편이에요. 신중하게 검토하세요.";
      } else if (score >= 1.0) {
        return "🚨 배당주로는 추천하기 어려워요. 대부분의 배당 지표가 좋지 않네요. 배당보다는 성장주를 고려해보세요.";
      } else {
        return "💸 배당 투자는 피하시는 게 좋겠어요. 배당 관련 데이터가 부족하거나 매우 불안정해요. 다른 종목을 찾아보세요!";
      }
    })(avgScore);
  }

  // 현금흐름 지표 분석
  if (stockData.cashFlow) {
    const cashFlow = stockData.cashFlow;
    analysis.cashFlow = {
      cash_f_operating_activities_ttm: {
        value: cashFlow.cash_f_operating_activities_ttm,
        score:
          Math.round(
            calculateIndicatorScore(
              cashFlow.cash_f_operating_activities_ttm,
              INDICATOR_RANGES.cashFlow.cash_f_operating_activities_ttm
            ) * 100
          ) / 100,
        analysis:
          cashFlow.cash_f_operating_activities_ttm >= 50000000000
            ? `와! 영업활동으로 ${(
                cashFlow.cash_f_operating_activities_ttm / 1000000000
              ).toFixed(1)}B 현금을 벌어들였네요! 정말 탄탄한 사업구조예요 💪`
            : cashFlow.cash_f_operating_activities_ttm >= 20000000000
            ? `영업활동으로 ${(
                cashFlow.cash_f_operating_activities_ttm / 1000000000
              ).toFixed(1)}B 현금을 창출했어요. 괜찮은 수준이네요 👍`
            : cashFlow.cash_f_operating_activities_ttm >= 0
            ? `영업활동 현금흐름이 ${(
                cashFlow.cash_f_operating_activities_ttm / 1000000000
              ).toFixed(1)}B로 양수예요. 나쁘지 않네요 😊`
            : `어? 영업활동에서 ${Math.abs(
                cashFlow.cash_f_operating_activities_ttm / 1000000000
              ).toFixed(1)}B 현금이 나갔네요. 좀 걱정되는 상황이에요 😰`,
      },
      cash_f_financing_activities_ttm: {
        value: cashFlow.cash_f_financing_activities_ttm,
        score:
          Math.round(
            calculateIndicatorScore(
              cashFlow.cash_f_financing_activities_ttm,
              INDICATOR_RANGES.cashFlow.cash_f_financing_activities_ttm
            ) * 100
          ) / 100,
        analysis:
          cashFlow.cash_f_financing_activities_ttm >= 20000000000
            ? `재무활동으로 ${(
                cashFlow.cash_f_financing_activities_ttm / 1000000000
              ).toFixed(1)}B 자금을 조달했어요! 성장 자금 확보가 잘 됐네요 💪`
            : cashFlow.cash_f_financing_activities_ttm >= 0
            ? `재무활동에서 ${(
                cashFlow.cash_f_financing_activities_ttm / 1000000000
              ).toFixed(1)}B 현금이 유입됐어요. 적당한 자금조달이네요 👍`
            : Math.abs(cashFlow.cash_f_financing_activities_ttm) <= 30000000000
            ? `재무활동으로 ${Math.abs(
                cashFlow.cash_f_financing_activities_ttm / 1000000000
              ).toFixed(1)}B가 나갔어요. 배당이나 부채 상환일 수 있어요 😊`
            : `재무활동에서 ${Math.abs(
                cashFlow.cash_f_financing_activities_ttm / 1000000000
              ).toFixed(
                1
              )}B 현금이 많이 나갔네요. 대규모 상환이 있었나 봐요 😮`,
      },
      free_cash_flow_ttm: {
        value: cashFlow.free_cash_flow_ttm,
        score:
          Math.round(
            calculateIndicatorScore(
              cashFlow.free_cash_flow_ttm,
              INDICATOR_RANGES.cashFlow.free_cash_flow_ttm
            ) * 100
          ) / 100,
        analysis:
          cashFlow.free_cash_flow_ttm >= 30000000000
            ? `자유현금흐름이 ${(
                cashFlow.free_cash_flow_ttm / 1000000000
              ).toFixed(1)}B예요! 회사가 자유롭게 쓸 수 있는 돈이 넉넉하네요 🌟`
            : cashFlow.free_cash_flow_ttm >= 10000000000
            ? `자유현금흐름이 ${(
                cashFlow.free_cash_flow_ttm / 1000000000
              ).toFixed(1)}B로 양호해요. 배당이나 투자 여력이 있어요 💰`
            : cashFlow.free_cash_flow_ttm >= 0
            ? `자유현금흐름이 ${(
                cashFlow.free_cash_flow_ttm / 1000000000
              ).toFixed(1)}B로 플러스예요. 최소한은 확보했네요 😊`
            : `자유현금흐름이 ${(
                cashFlow.free_cash_flow_ttm / 1000000000
              ).toFixed(1)}B로 마이너스네요. 현금 확보가 필요해 보여요 😰`,
      },
    };

    // 현금흐름 부문 평균 점수
    const cashFlowScores = Object.values(analysis.cashFlow).map(
      (item) => item.score
    );
    const avgScore =
      Math.round(
        (cashFlowScores.reduce((a, b) => a + b, 0) / cashFlowScores.length) *
          100
      ) / 100;

    analysis.cashFlow.averageScore = avgScore;

    // 현금흐름 부문 종합 의견 추가
    analysis.cashFlow.overallAnalysis = (function (score) {
      if (score >= 4.5) {
        return "🌟 현금흐름이 완벽해요! 영업으로 돈을 잘 벌고, 재무활동도 건전하고, 자유현금흐름도 넉넉해요. 재무적으로 매우 건전한 회사네요!";
      } else if (score >= 4.0) {
        return "💪 현금흐름이 아주 좋아요! 3대 핵심 지표가 모두 우수하고 현금 창출 능력이 탁월해요. 투자하기 좋은 회사예요!";
      } else if (score >= 3.5) {
        return "👍 현금흐름이 괜찮아요! 몇 가지 아쉬운 부분이 있지만 전반적으로 안정적인 현금 관리를 하고 있어요.";
      } else if (score >= 3.0) {
        return "😐 현금흐름이 보통 수준이에요. 영업, 재무, FCF 중 일부 개선이 필요할 수 있어요.";
      } else if (score >= 2.0) {
        return "⚠️ 현금흐름에 문제가 있어 보여요. 핵심 현금 지표들이 불안정하니 신중하게 검토하세요.";
      } else if (score >= 1.0) {
        return "🚨 현금흐름이 좋지 않아요. 영업활동이나 재무활동에서 현금 문제가 심각할 수 있어요.";
      } else {
        return "💸 현금흐름이 매우 위험해요! 3대 핵심 지표 모두 문제가 있어 투자를 피하는 게 좋겠어요.";
      }
    })(avgScore);
  }
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
      if (score >= 4.5) return "A+ (투자하기 정말 좋은 회사! 🌟)";
      if (score >= 4.0) return "A (투자할 만한 우수한 회사 👍)";
      if (score >= 3.5) return "B+ (나쁘지 않은 괜찮은 회사 😊)";
      if (score >= 3.0) return "B (그럭저럭 보통인 회사 😐)";
      if (score >= 2.0) return "C (좀 위험할 수 있는 회사 ⚠️)";
      return "D (투자하기엔 너무 위험한 회사 🚨)";
    })(
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0
    ),
    recommendation: (function (score) {
      if (score >= 4.0) return "사도 좋을 것 같아요! 💰";
      if (score >= 3.0) return "일단 지켜보거나 조금만 사는 게 어떨까요? 🤔";
      return "지금은 사지 않는 게 좋겠어요 😔";
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
    cashFlow: {
      operatingCashFlow: 50,
      financingCashFlow: 10,
      freeCashFlow: 30,
    },
  };

  const result = analyzeStock(sampleStock);

  console.log(result);

  console.log("📊 종목 분석 결과:");
  console.log("=".repeat(50));

  // 배당 지표 출력
  if (result.dividend) {
    console.log("\n🏆 배당 지표 분석:");
    Object.entries(result.dividend).forEach(([key, data]) => {
      if (key !== "averageScore" && key !== "overallAnalysis") {
        console.log(
          `  ${key}: ${data.value} → ${data.score}/5점 (${data.analysis})`
        );
      }
    });
    console.log(`\n💰 배당 부문 평균: ${result.dividend.averageScore}/5점`);
    console.log(`📝 배당 부문 종합: ${result.dividend.overallAnalysis}`);
  }

  // 현금흐름 지표 출력
  if (result.cashFlow) {
    console.log("\n💵 현금흐름 지표 분석:");
    Object.entries(result.cashFlow).forEach(([key, data]) => {
      if (key !== "averageScore" && key !== "overallAnalysis") {
        console.log(
          `  ${key}: ${data.value} → ${data.score}/5점 (${data.analysis})`
        );
      }
    });
    console.log(`\n💸 현금흐름 부문 평균: ${result.cashFlow.averageScore}/5점`);
    console.log(`📝 현금흐름 부문 종합: ${result.cashFlow.overallAnalysis}`);
  }

  // 종합 평가
  console.log("\n🎯 종합 평가:");
  console.log(`  총점: ${result.overall.totalScore}/5점`);
  console.log(`  등급: ${result.overall.rating}`);
  console.log(`  추천: ${result.overall.recommendation}`);

  return result;
}

// 웹 워커에서 사용 시 전역으로 노출
if (typeof self !== "undefined" && typeof window === "undefined") {
  // 웹 워커 환경
  self.analyzeStock = analyzeStock;
  self.calculateIndicatorScore = calculateIndicatorScore;
  self.INDICATOR_RANGES = INDICATOR_RANGES;
  self.exampleAnalysis = exampleAnalysis;
}

// 모듈 내보내기
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_RANGES,
    exampleAnalysis,
  };
}

// 브라우저에서 직접 실행 시
if (typeof window !== "undefined") {
  window.StockAnalyzer = {
    analyzeStock,
    calculateIndicatorScore,
    INDICATOR_RANGES,
    exampleAnalysis,
  };
}

// 직접 실행 시 예시 출력
if (typeof require !== "undefined" && require.main === module) {
  exampleAnalysis();
}
