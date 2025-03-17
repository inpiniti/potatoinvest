import { Button } from '@/components/ui/button';
import { useTempKeyStore } from '@/store/useTempKeyStore';
import { useKeyStore } from '@/store/useKeyStore';
import ApiContent from './ApiContent';
import { useState } from 'react';

const TokenP = () => {
  const { key: tempKey, setKey } = useTempKeyStore();
  const { key } = useKeyStore();

  const [result, setResult] = useState('');

  const handleButtonClick = async () => {
    const { appKey, secretKey } = key;
    const url = '/api/koreainvestment/oauth2/tokenP';
    const body = {
      appkey: appKey,
      appsecret: secretKey,
      solt: tempKey.password,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));

      setKey({
        ...tempKey,
        ...data,
      });

      alert('접근토큰이 발급되었습니다.');
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

export default TokenP;
