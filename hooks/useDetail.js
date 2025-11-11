import { useQuery } from "@tanstack/react-query";
import useKakao from "./useKakao";

const useDetail = ({ excd, symb }) => {
  const { data } = useKakao();
  const api = useApi();

  // 분봉 조회 use query
  const query = useQuery({
    queryKey: ["repoData"],
    queryFn: () => {
      const response = api.quotations.inquireTimeItemchartprice({ excd, symb });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      return response.json();
    },
    //   fetch("/api/koreainvestment/quotations/inquireTimeItemchartprice", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${data.session.access_token}`,
    //     },
    //     body: JSON.stringify({
    //       excd,
    //       symb,
    //     }),
    //   }).then((res) => res.json()),
  });

  return { query };
};

export default useDetail;
