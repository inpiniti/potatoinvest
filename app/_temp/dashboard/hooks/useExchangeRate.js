import { useMutation } from "@tanstack/react-query";

const useExchangeRate = () => {
  const fetchExchangeRate = async () => {
    const response = await fetch(`/api/exchangeRate`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data || {};
  };

  // useMutation 사용, 사용자가 직접 호출
  const mutation = useMutation({
    mutationFn: fetchExchangeRate,
    onError: (error) => {
      console.error("검색 정보 쿼리 오류:", error);
    },
  });

  return mutation;
};

export default useExchangeRate;
