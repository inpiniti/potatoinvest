import { Button } from "@/components/ui/button";
import { useTempKeyStore } from "@/store/useTempKeyStore";
import { useKeyStore } from "@/store/useKeyStore";

const TokenP = () => {
  const { setKey } = useTempKeyStore();
  const { getKey } = useKeyStore();

  const handleButtonClick = async () => {
    const { vtsAppKey, vtsSecretKey } = getKey();
    const url = "https://openapivts.koreainvestment.com:29443/oauth2/tokenP";
    const body = {
      grant_type: "client_credentials",
      appkey: vtsAppKey,
      appsecret: vtsSecretKey,
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
        ...data,
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        access_token_token_expired: data.access_token_token_expired,
      });
    } catch (error) {
      console.error("Error issuing token:", error);
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
