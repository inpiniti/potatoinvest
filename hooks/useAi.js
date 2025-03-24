import * as tf from "@tensorflow/tfjs";

const useAi = () => {
  // 데이터 가져오기
  const 데이터가져오기 = async () => {
    const response = await fetch("/api/hello");
    return response.json();
  };

  // 전처리
  const 전처리 = (data) => {
    try {
      const features = []; //: number[][] = []; // 특징

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

        // 선택된 필드만 feature 배열에 추가합니다.
        const feature = selectedFields.map((field) => {
          const value = row[field];
          // 숫자로 변환 가능한지 확인하고, 가능하면 변환합니다.
          return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
        }); // as number[];

        // labelCallback이 필요 없는 경우, 이 부분은 제거하거나 주석 처리
        // const label = labelCallback(row, dbFieldAgo);

        features.push(feature);
      });

      return tf.tensor2d(features);
    } catch (error) {
      console.error("error017", error);
      throw error;
    }
  };

  // 예측
  const 예측 = async (
    model, //: tf.LayersModel
    inputData //: any
  ) => {
    try {
      // 입력 데이터 확인
      if (!inputData || inputData.length === 0) {
        throw new Error("Input data is empty or undefined");
      }

      // 모델을 사용하여 예측
      const predictions = model.predict(inputData); // as tf.Tensor;

      // 예측 결과를 배열로 변환
      const predictedValues = await predictions.data();

      // 예측 결과 반환
      return Array.from(predictedValues);
    } catch (error) {
      console.error("error018", error);
      throw error;
    }
  };

  // 역직렬화
  const 역직렬화 = async (
    modelJson, //: any,
    weightsJson //: any
  ) => {
    try {
      // 모델 JSON을 기반으로 새로운 모델 생성
      const model = await tf.models.modelFromJSON(modelJson);

      // 가중치 복원
      const weightsArray = proxyToObject(weightsJson);
      const weights = weightsArray.map(
        (
          weight, //: any,
          index //: number
        ) => {
          const shape = model.weights[index].shape;

          // weight 객체의 값을 배열로 변환
          const weightValues = Object.values(weight).map((value) =>
            Number(value)
          );

          return tf.tensor(weightValues, shape);
        }
      );

      // 가중치 설정
      model.setWeights(weights);

      return model;
    } catch (error) {
      console.error("error016", error);
      throw error;
    }
  };

  function proxyToObject(proxy) {
    if (Array.isArray(proxy)) {
      return proxy.map((item) => proxyToObject(item));
    } else if (proxy !== null && typeof proxy === "object") {
      const obj = {};
      for (const key in proxy) {
        if (proxy.hasOwnProperty(key)) {
          obj[key] = proxyToObject(proxy[key]);
        }
      }
      return obj;
    } else {
      return proxy;
    }
  }

  return {
    데이터가져오기,
    전처리,
    역직렬화,
    예측,
  };
};

export default useAi;
