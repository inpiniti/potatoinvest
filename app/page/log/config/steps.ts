/**
 * 스텝 구성을 정의하는 설정 파일
 */
import { StepConfig } from "../types";
import { api } from "../services/api";

/**
 * 모든 스텝 구성을 정의합니다.
 */
export const stepConfigs: Record<string, StepConfig> = {
  // 발급키 확인 스텝
  verifyKey: {
    id: "verifyKey",
    title: "발급키 확인",
    executeImmediately: true, // 자동 실행
    process: api.verifyKey,
    processingMessage: "발급키 확인 중입니다.",
    successMessage: "발급된 키가 존재합니다.",
    failureMessage:
      "발급된 키가 존재하지 않습니다. 키를 발급받은 후 진행해주세요.",
    nextStepOnSuccess: "verifyToken",
    nextStepOnFailure: "issueToken",
  },

  // 토큰 확인 스텝
  verifyToken: {
    id: "verifyToken",
    title: "토큰 확인",
    executeImmediately: true,
    process: api.verifyToken,
    processingMessage: "토큰 유효성 확인 중입니다.",
    successMessage: "유효한 토큰이 존재합니다.",
    failureMessage: "유효한 토큰이 존재하지 않습니다.",
    nextStepOnSuccess: "checkTokenTime",
    nextStepOnFailure: "issueToken",
  },

  // 토큰 발급 스텝
  issueToken: {
    id: "issueToken",
    title: "토큰 발급",
    executeImmediately: true,
    process: api.issueToken,
    processingMessage: "새로운 토큰을 발급 중입니다.",
    successMessage: "새 토큰이 발급되었습니다.",
    failureMessage: "토큰 발급에 실패했습니다. 다시 시도해주세요.",
    nextStepOnSuccess: "checkTokenTime",
    nextStepOnFailure: "verifyKey", // 실패 시 다시 키 확인부터
  },

  // 토큰 남은 시간 확인 스텝
  checkTokenTime: {
    id: "checkTokenTime",
    title: "토큰 유효 시간 확인",
    executeImmediately: true,
    process: api.checkTokenTime,
    processingMessage: "토큰 남은 시간을 확인 중입니다.",
    successMessage: (result) =>
      `토큰이 유효합니다 (남은 시간: ${result.data.remainingTime}초)`,
    failureMessage: "토큰이 만료되었거나 유효하지 않습니다.",
    nextStepOnSuccess: "checkStockBalance",
    nextStepOnFailure: "issueToken",
  },

  // 주식 잔고 확인 스텝
  checkStockBalance: {
    id: "checkStockBalance",
    title: "주식 잔고 확인",
    executeImmediately: true,
    process: api.checkStockBalance,
    processingMessage: "주식 잔고를 확인 중입니다.",
    successMessage: "주식 잔고 조회가 완료되었습니다.",
    failureMessage: "주식 잔고 조회에 실패했습니다.",
    nextStepOnSuccess: "checkPendingOrders",
    nextStepOnFailure: "checkStockBalance", // 실패 시 다시 시도
  },

  // 미체결 내역 조회 스텝
  checkPendingOrders: {
    id: "checkPendingOrders",
    title: "미체결 내역 조회",
    executeImmediately: true,
    process: api.checkPendingOrders,
    processingMessage: "미체결 내역을 조회 중입니다.",
    successMessage: "미체결 내역 조회가 완료되었습니다.",
    failureMessage: "미체결 내역 조회에 실패했습니다.",
    nextStepOnSuccess: "sellStock",
    nextStepOnFailure: "checkPendingOrders", // 실패 시 다시 시도
  },

  // 매도 스텝 (사용자 확인 필요)
  sellStock: {
    id: "sellStock",
    title: "주식 매도",
    executeImmediately: false, // 사용자 확인 필요
    process: api.sellStock,
    processingMessage: "매도 주문을 처리 중입니다.",
    successMessage: "매도 주문이 완료되었습니다.",
    failureMessage: (error) =>
      `매도 주문 실패: ${error.message || "알 수 없는 오류"}`,
    nextStepOnSuccess: "buyStock",
    nextStepOnFailure: "sellStock", // 실패 시 다시 시도
  },

  // 매수 스텝 (사용자 확인 필요)
  buyStock: {
    id: "buyStock",
    title: "주식 매수",
    executeImmediately: false, // 사용자 확인 필요
    process: api.buyStock,
    processingMessage: "매수 주문을 처리 중입니다.",
    successMessage: "매수 주문이 완료되었습니다.",
    failureMessage: (error) =>
      `매수 주문 실패: ${error.message || "알 수 없는 오류"}`,
    nextStepOnSuccess: "checkStockBalance", // 거래 후 잔고 확인으로
    nextStepOnFailure: "buyStock", // 실패 시 다시 시도
  },

  // 테스트 스텝 추가
  test: {
    id: "test",
    title: "테스트 스텝",
    description: "워크플로우 테스트를 위한 스텝입니다",
    type: "info",
    process: async () => {
      console.log("테스트 스텝 실행");
      return {
        success: true,
        message: "테스트 완료",
      };
    },
    nextStepOnSuccess: "verifyKey", // 또는 다른 적절한 스텝
    nextStepOnFailure: null,
    executeImmediately: true,
  },
};

// 초기 시작 스텝 ID
export const initialStepId = "test";

// 이 파일을 확인하여 초기 스텝의 process 함수가 제대로 반환하고 있는지 확인
console.log("Initial Step Config:", stepConfigs[initialStepId]);
