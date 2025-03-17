import { Button } from '@/components/ui/button';
import { useTempKeyStore } from '@/store/useTempKeyStore';
import { useKeyStore } from '@/store/useKeyStore';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useState } from 'react';
import ApiContent from './ApiContent';

const Price = () => {
  const { key: tempKey } = useTempKeyStore();
  const { key } = useKeyStore();

  const [result, setResult] = useState('');
  const [excd, setExcd] = useState('NYS');
  const [symb, setSymb] = useState('APPL');

  const handleButtonClick = async () => {
    const { appKey, secretKey } = key;
    const url = '/api/koreainvestment/quotations/price';
    const body = {
      appkey: appKey,
      appsecret: secretKey,
      solt: tempKey.password,
      token: tempKey.access_token,
      excd: excd,
      symb: symb,
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

      alert('해외주식 현재체결가가 조회되었습니다.');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 현재체결가"
      endPoint="/quotations/price"
      disabled={false}
      result={result}
    >
      <Drawer>
        <DrawerTrigger>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>해외주식 현재체결가</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-6">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="excd">거래소 코드</Label>
              <RadioGroup
                className="flex gap-4"
                defaultValue="comfortable"
                value={excd}
                onValueChange={(value) => setExcd(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NYS" id="r1" />
                  <Label htmlFor="r1">NYS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NAS" id="r2" />
                  <Label htmlFor="r2">NAS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AMS" id="r3" />
                  <Label htmlFor="r3">AMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TSE" id="r4" />
                  <Label htmlFor="r4">TSE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HKS" id="r5" />
                  <Label htmlFor="r5">HKS</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="symb">종목 코드</Label>
              <RadioGroup
                className="flex gap-4"
                defaultValue="comfortable"
                value={symb}
                onValueChange={(value) => setSymb(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="APPL" id="r1" />
                  <Label htmlFor="r1">APPL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TSLA" id="r2" />
                  <Label htmlFor="r2">TSLA</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DrawerFooter>
            <div className="flex items-center justify-end w-full gap-2">
              <Button onClick={handleButtonClick}>조회</Button>
              <DrawerClose>
                <Button variant="outline">취소</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ApiContent>
  );
};

export default Price;
