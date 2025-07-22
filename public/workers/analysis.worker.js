// 웹 워커 스크립트 - React 라이브러리 사용 불가

// TensorFlow.js 라이브러리 불러오기 (웹 워커에서 사용 가능한 방식)
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");

// Stock Analyzer 불러오기 (public 폴더에서)
importScripts("/stock-analyzer.js");

// 데이터 가져오기 함수
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
};

// 전처리 함수
const preprocess = (data) => {
  try {
    const features = [];

    data.forEach((row) => {
      // 사용할 필드 이름을 배열로 정의
      const selectedFields = [
        "operating_margin_ttm",
        "relative_volume_10d_calc",
        "enterprise_value_to_revenue_ttm",
        "volatility_w",
        "volatility_m",
        "dividends_yield_current",
        "gap",
        "volume_change",
        "pre_tax_margin_ttm",
        "perf_1_y_market_cap",
        "perf_w",
        "perf_1_m",
        "perf_3_m",
        "perf_6_m",
        "perf_y_t_d",
        "perf_y",
        "perf_5_y",
        "perf_10_y",
        "recommend_all",
        "recommend_m_a",
        "recommend_other",
        "r_s_i",
        "mom",
        "c_c_i20",
        "stoch_k",
        "stoch_d",
      ];

      // 선택된 필드만 feature 배열에 추가
      const feature = selectedFields.map((field) => {
        const value = row[field];
        return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
      });

      features.push(feature);
    });

    return tf.tensor2d(features);
  } catch (error) {
    throw new Error(`전처리 오류: ${error.message}`);
  }
};

// 객체를 일반 Object로 변환하는 함수
function toObject(proxy) {
  if (Array.isArray(proxy)) {
    return proxy.map((item) => toObject(item));
  } else if (proxy !== null && typeof proxy === "object") {
    const obj = {};
    for (const key in proxy) {
      if (proxy.hasOwnProperty(key)) {
        obj[key] = toObject(proxy[key]);
      }
    }
    return obj;
  } else {
    return proxy;
  }
}

// 모델 역직렬화 함수
const deserializeModel = async (modelJson, weightsJson) => {
  try {
    // 모델 JSON을 기반으로 새로운 모델 생성
    const model = await tf.models.modelFromJSON(modelJson);

    // 가중치 복원
    const weightsArray = toObject(weightsJson);
    const weights = weightsArray.map((weight, index) => {
      const shape = model.weights[index].shape;

      // weight 객체의 값을 배열로 변환
      const weightValues = Object.values(weight).map((value) => Number(value));

      return tf.tensor(weightValues, shape);
    });

    // 가중치 설정
    model.setWeights(weights);

    return model;
  } catch (error) {
    throw new Error(`모델 역직렬화 오류: ${error.message}`);
  }
};

// 예측 함수
const predict = async (model, inputData) => {
  try {
    // 입력 데이터 확인
    if (!inputData || inputData.length === 0) {
      throw new Error("입력 데이터가 비어있습니다");
    }

    // 모델을 사용하여 예측
    const predictions = model.predict(inputData);

    // 예측 결과를 배열로 변환
    const predictedValues = await predictions.data();

    // 텐서 해제
    predictions.dispose();

    // 예측 결과 반환
    return Array.from(predictedValues);
  } catch (error) {
    throw new Error(`예측 오류: ${error.message}`);
  }
};

// 데이터 처리 및 분석 주 함수
const processData = async (rawData, aiModels) => {
  try {
    // 1. 데이터 전처리
    const processedData = preprocess(rawData);

    // 2. 모델 로드 및 역직렬화 - 모든 모델 병렬 처리
    const models = await Promise.all(
      aiModels.map((model) => deserializeModel(model.model, model.weights))
    );

    // 3. 예측 수행 - 모든 모델 병렬 처리
    const predictions = await Promise.all(
      models.map((model) => predict(model, processedData))
    );

    // 4. 예측 결과 평균 계산
    const predictionAverage = predictions[0].map((_, colIndex) => {
      let sum = 0;
      for (let rowIndex = 0; rowIndex < predictions.length; rowIndex++) {
        sum += predictions[rowIndex][colIndex];
      }
      return sum / predictions.length;
    });

    // 5. 텐서 해제
    processedData.dispose();
    models.forEach((model) => model.dispose());

    // 6. 분석 데이터에 예측 결과 추가
    const analysisData = rawData.map((row, index) => {
      // 기본 데이터에 예측 결과 추가
      const stockWithPrediction = {
        ...row,
        예측결과: predictionAverage[index],
        type: "분석",
        processedAt: new Date().toISOString(),
      };

      // 새로운 6가지 지표 종합 분석 수행
      let comprehensiveAnalysis = null;
      try {
        if (typeof analyzeStock === "function") {
          // 전체 종목 데이터를 분석기에 전달
          comprehensiveAnalysis = analyzeStock(row);
        }
      } catch (error) {
        console.warn("종합 분석 중 오류:", error.message);
      }

      // 종합 분석 결과 추가
      return {
        ...stockWithPrediction,
        // 기존 호환성을 위한 필드들 (배당, 현금흐름)
        dividend: comprehensiveAnalysis?.배당지표평가 || null,
        cashFlow: comprehensiveAnalysis?.대차대조표평가 || null,
        // 새로운 6가지 지표 분석 결과
        comprehensiveAnalysis: comprehensiveAnalysis,
      };
    });

    return analysisData;
  } catch (error) {
    throw new Error(`데이터 처리 오류: ${error.message}`);
  }
};

// 분석 데이터 필터링 함수
// const filterAnalysisData = (data) => {
//   if (!data || !Array.isArray(data)) return [];

//   // 1. 중요 필드만 선택 (데이터 크기 줄이기)
//   const essentialFields = data.map((item) => ({
//     name: item.name || "",
//     description: item.description || "",
//     logoid: item.logoid || "",
//     close: item.close,
//     change: item.change,
//     volume_change: item.volume_change || 0,
//     perf_1_m: item.perf_1_m || 0,
//     perf_3_m: item.perf_3_m || 0,
//     perf_6_m: item.perf_6_m || 0,
//     perf_w: item.perf_w || 0,
//     perf_1_y: item.perf_1_y || 0,
//     예측결과: item.예측결과,
//   }));

//   // 2. 기준에 맞는 항목만 필터링
//   return (
//     essentialFields
//       // .filter((item) => item.예측결과 >= 0.6) // 예측 점수 0.6 이상
//       // .filter((item) => item.close !== undefined && item.close >= 2) // 종가 2 이상
//       // .filter((item) => {
//       //   // 한달 변동률이 -10% 이하인 종목만 선택
//       //   const monthlyPerf = item.perf_1_m !== undefined ? item.perf_1_m : 0;
//       //   return monthlyPerf <= -10;
//       // })
//       .sort((a, b) => {
//         // perf_1_m이 없는 경우 기본값 0으로 처리
//         const aPerf = a.perf_1_m !== undefined ? a.perf_1_m : 0;
//         const bPerf = b.perf_1_m !== undefined ? b.perf_1_m : 0;
//         return aPerf - bPerf; // 오름차순 정렬 (가장 하락폭이 큰 순)
//       })
//   );
// };

// 워커 메시지 이벤트 핸들러
self.addEventListener("message", async (e) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case "PROCESS_DATA": {
        const { rawData, aiModels } = payload;
        const result = await processData(rawData, aiModels);
        self.postMessage({ type: "PROCESS_COMPLETE", payload: result });
        break;
      }

      case "FETCH_AND_PROCESS": {
        const { url, aiModels } = payload;
        const data = await fetchData(url);

        if (data.error) {
          throw new Error(data.error);
        }

        const result = await processData(data, aiModels);
        self.postMessage({ type: "PROCESS_COMPLETE", payload: result });
        break;
      }

      default:
        throw new Error(`알 수 없는 메시지 타입: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: error.message || "처리 중 오류가 발생했습니다",
    });
  }
});

// 웹 워커 초기화 완료 알림
self.postMessage({ type: "WORKER_READY" });
