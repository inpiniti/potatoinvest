import { Button } from "@/components/ui/button";
import { tempKeyStore } from "@/store/tempKeyStore";
import ApiContent from "../ApiContent";
import { useState } from "react";
import useApi from "@/hooks/useApi";

const Order = () => {
  const api = useApi();

  const { key: tempKey, setKey } = tempKeyStore();

  const [result, setResult] = useState("");

  const handleButtonClick = async () => {
    try {
      const response = await api.oauth2.tokenP();
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));

      setKey({
        ...tempKey,
        ...data,
      });

      alert("접근토큰이 발급되었습니다.");
    } catch (error) {
      setResult(JSON.stringify(error, null, 2));
      alert(error);
    }
  };

  return (
    <ApiContent
      title="접근토큰발급(P)"
      endPoint="/oauth2/tokenP"
      disabled={false}
      result={result}
    >
      <Button onClick={handleButtonClick}>API 호출</Button>
    </ApiContent>
  );
};

export default Order;
