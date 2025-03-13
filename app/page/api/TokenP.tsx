import { Button } from "@/components/ui/button";
import { useTempKeyStore } from "@/store/useTempKeyStore";
import { useKeyStore } from "@/store/useKeyStore";

const TokenP = () => {
  const { key: tempKey, setKey } = useTempKeyStore();
  const { key } = useKeyStore();

  const handleButtonClick = async () => {
    const { appKey, secretKey } = key;
    const url = "/api/koreainvestment/oauth2/tokenP";
    const body = {
      appkey: appKey,
      appsecret: secretKey,
      solt: tempKey.password,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      setKey({
        ...tempKey,
        ...data,
      });

      alert("접근토큰이 발급되었습니다.");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <section className="flex items-center justify-between p-4">
      <div className="flex gap-4">
        <b>접근토큰발급(P)[인증-001]</b>
        <p>/oauth2/tokenP</p>
      </div>
      <Button onClick={handleButtonClick}>API 호출</Button>
    </section>
  );
};

export default TokenP;
