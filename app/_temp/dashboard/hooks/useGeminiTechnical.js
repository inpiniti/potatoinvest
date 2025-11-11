import { useMutation } from "@tanstack/react-query";

const useGeminiTechnical = () => {
  const fetchGeminiTechnical = async ({ ticker, technicalData }) => {
    if (!ticker) {
      throw new Error("종목코드(ticker)가 필요합니다.");
    }

    if (!technicalData) {
      throw new Error("기술적 지표 데이터(technicalData)가 필요합니다.");
    }

    const response = await fetch(`/api/gemini/technical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        technicalData,
      }),
    });

    if (!response.ok) {
      throw new Error(`기술적 분석 API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data || {};
  };

  // useMutation 사용, 사용자가 직접 호출
  const mutation = useMutation({
    mutationFn: fetchGeminiTechnical,
    onError: (error) => {
      console.error("Gemini 기술적 분석 API 쿼리 오류:", error);
    },
  });

  return mutation;
};

export default useGeminiTechnical;
