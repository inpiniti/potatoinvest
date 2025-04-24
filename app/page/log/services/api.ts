/**
 * API 서비스 모듈
 * 각 API 호출 함수를 정의합니다.
 */

/**
 * 모의 API 호출 함수 - 실제 구현에서는 실제 API를 호출하도록 변경
 */
const mockApiCall = async (endpoint: string, data?: any): Promise<any> => {
  console.log(`API 호출: ${endpoint}`, data);

  // 랜덤 지연 시간 (500ms ~ 2000ms)
  const delay = Math.floor(Math.random() * 1500) + 500;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90% 확률로 성공
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          message: `${endpoint} 처리 완료`,
          data: getMockResponseData(endpoint, data),
        });
      } else {
        reject({
          success: false,
          message: `${endpoint} 처리 실패`,
          error: "서버 오류",
        });
      }
    }, delay);
  });
};

/**
 * 각 API 엔드포인트에 맞는 모의 응답 데이터 생성
 */
const getMockResponseData = (endpoint: string, requestData?: any) => {
  switch (endpoint) {
    case "verifyKey":
      return { keyExists: true, keyInfo: { expiration: "2025-12-31" } };

    case "verifyToken":
      return { tokenExists: true, tokenInfo: { expiresIn: 3600 } };

    case "issueToken":
      return { token: "mock-token-12345", expiresIn: 3600 };

    case "checkTokenTime":
      return { remainingTime: 2450, isValid: true };

    case "checkStockBalance":
      return {
        totalBalance: 10000000,
        stocks: [
          {
            symbol: "AAPL",
            name: "Apple Inc.",
            quantity: 10,
            averagePrice: 170.5,
            currentPrice: 175.2,
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corp",
            quantity: 5,
            averagePrice: 290.3,
            currentPrice: 310.7,
          },
        ],
      };

    case "checkPendingOrders":
      return {
        pendingOrders: [
          {
            id: "ord-001",
            symbol: "AAPL",
            type: "buy",
            quantity: 2,
            price: 169.5,
            status: "pending",
          },
        ],
      };

    case "sellStock":
      return {
        orderId: `sell-${Date.now()}`,
        symbol: requestData?.symbol || "AAPL",
        quantity: requestData?.quantity || 1,
        price: 178.25,
        status: "completed",
      };

    case "buyStock":
      return {
        orderId: `buy-${Date.now()}`,
        symbol: requestData?.symbol || "MSFT",
        quantity: requestData?.quantity || 1,
        price: 305.75,
        status: "completed",
      };

    default:
      return {};
  }
};

// 외부에서 사용할 API 함수들
export const api = {
  verifyKey: () => mockApiCall("verifyKey"),
  verifyToken: () => mockApiCall("verifyToken"),
  issueToken: () => mockApiCall("issueToken"),
  checkTokenTime: () => mockApiCall("checkTokenTime"),
  checkStockBalance: () => mockApiCall("checkStockBalance"),
  checkPendingOrders: () => mockApiCall("checkPendingOrders"),
  sellStock: (data: { symbol: string; quantity: number }) =>
    mockApiCall("sellStock", data),
  buyStock: (data: { symbol: string; quantity: number }) =>
    mockApiCall("buyStock", data),
};
