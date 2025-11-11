import { useMutation } from "@tanstack/react-query";

const useGeminiFinancial = () => {
  const fetchGemini = async ({ code }) => {
    const response = await fetch(`/api/gemini/financial?qry=${code}`, {
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
    mutationFn: fetchGemini,
    onError: (error) => {
      console.error("Gemini API 쿼리 오류:", error);
    },
  });

  return mutation;
};

export default useGeminiFinancial;
