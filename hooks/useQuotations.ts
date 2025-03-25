import useApi from "./useApi";

const useQuotations = () => {
  const api = useApi();

  const 조건검색 = async (종목코드: string) => {
    const response = await api.quotations.inquireSearch({
      EXCD: "NAS",
    });
    const list = await response.json();

    const newData = list?.output2?.find(
      (item: { symb: string }) => item?.symb === 종목코드
    );

    return newData;
  };

  const 현재가상세 = async (종목코드: string) => {
    const response = await api.quotations.priceDetail({
      EXCD: "NAS",
      SYMB: 종목코드,
    });
    const json = await response.json();

    if (json?.output) {
      return json.output;
    } else {
      return json;
    }
  };

  return { 조건검색, 현재가상세 };
};

export default useQuotations;
