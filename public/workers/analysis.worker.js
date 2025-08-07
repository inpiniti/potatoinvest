// 웹 워커 스크립트 - React 라이브러리 사용 불가
// 서버에서 예측을 처리하므로 TensorFlow.js는 더 이상 필요하지 않음

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

// 클라이언트사이드 분석 처리 함수 (서버에서 예측결과를 받아 추가 분석만 수행)
const processData = async (serverProcessedData) => {
  try {
    // 서버에서 이미 예측 결과가 포함된 데이터를 받아서 추가 분석만 수행
    const analysisData = serverProcessedData.map((row) => {
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

      // 종합 분석 결과 추가 (서버에서 온 예측결과는 그대로 유지)
      return {
        ...row,
        // 기존 호환성을 위한 필드들 (배당, 현금흐름)
        dividend: comprehensiveAnalysis?.배당지표평가 || null,
        cashFlow: comprehensiveAnalysis?.대차대조표평가 || null,
        // 새로운 6가지 지표 분석 결과
        comprehensiveAnalysis: comprehensiveAnalysis,
      };
    });

    return analysisData;
  } catch (error) {
    throw new Error(`클라이언트 분석 처리 오류: ${error.message}`);
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
        // 서버에서 예측 결과가 포함된 데이터를 받아서 추가 분석만 수행
        const { serverProcessedData } = payload;
        const result = await processData(serverProcessedData);
        self.postMessage({ type: "PROCESS_COMPLETE", payload: result });
        break;
      }

      case "FETCH_AND_PROCESS": {
        // 서버 API에서 예측 결과가 포함된 데이터를 가져와서 추가 분석 수행
        const { url } = payload;
        const data = await fetchData(url);

        if (data.error) {
          throw new Error(data.error);
        }

        const result = await processData(data);
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
