import { logos } from "@/json/logoData";

// 로고 URL 가져오기
export const getLogoUrl = (item) => {
  // 1. 아이템에 logoid가 있으면 그대로 사용
  if (item.logoid) {
    return `https://s3-symbol-logo.tradingview.com/${item.logoid}--big.svg`;
  }

  // 2. 종목코드로 로고 찾기
  const stockCode = item.name || item.ovrs_pdno || item.pdno || item.code;
  if (stockCode) {
    // logos 배열에서 일치하는 로고 찾기
    const logo = logos.find((logo) => logo.name === stockCode);
    if (logo && logo.logoid) {
      return `https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`;
    }
  }

  // 3. 로고가 없으면 빈 문자열 반환
  return "";
};

// 종목코드로 로고 url 가져오기
export const getLogoUrlByCode = (code) => {
  if (!code) return "";

  // logos 배열에서 일치하는 로고 찾기
  const logo = logos.find((logo) => logo.name === code);
  if (logo && logo.logoid) {
    return `https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`;
  }

  // 로고가 없으면 빈 문자열 반환
  return "";
};

// 로고 아이디로 로고 URL 가져오기
export const getLogoUrlById = (logoid) => {
  if (!logoid) return "";

  // 로고 URL 생성
  return `https://s3-symbol-logo.tradingview.com/${logoid}--big.svg`;
};

// 공통 로고가 있는 종목들의 매핑
export const commonLogoMappings = {
  MSFT: "microsoft",
  AAPL: "apple",
  GOOGL: "alphabet",
  GOOG: "alphabet",
  AMZN: "amazon",
  META: "meta",
  NFLX: "netflix",
  TSLA: "tesla",
};

export const getSelectedStockCode = (selectedStock) => {
  if (!selectedStock) return null;

  return (
    selectedStock.name ||
    selectedStock.code ||
    selectedStock.ovrs_pdno ||
    selectedStock.pdno
  );
};
