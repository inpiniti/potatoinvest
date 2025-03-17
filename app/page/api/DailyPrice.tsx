import { Button } from '@/components/ui/button';
import { useTempKeyStore } from '@/store/useTempKeyStore';
import { useKeyStore } from '@/store/useKeyStore';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useState } from 'react';
import ApiContent from './ApiContent';

const DailyPrice = () => {
  const { key: tempKey } = useTempKeyStore();
  const { key } = useKeyStore();

  const [excd, setExcd] = useState('');
  const [symb, setSymb] = useState('');
  const [gubn, setGubn] = useState('0');
  const [modp, setModp] = useState('0');

  const handleButtonClick = async () => {
    const { appKey, secretKey } = key;
    const url = '/api/koreainvestment/quotations/dailyprice';
    const body = {
      appkey: appKey,
      appsecret: secretKey,
      solt: tempKey.password,
      token: tempKey.access_token,
      excd: excd,
      symb: symb,
      gubn: gubn,
      modp: modp,
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

      console.log(data);

      alert('해외주식 기간별시세를 조회되었습니다.');
    } catch (error) {
      alert(error);
    }
  };

  return (
    <ApiContent
      title="해외주식 기간별시세"
      endPoint="/quotations/dailyprice"
      disabled={false}
    >
      <Drawer>
        <DrawerTrigger>
          <Button>API 호출</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>다음정보를 입력해주세요.</DrawerTitle>
            <DrawerDescription>
              거래소 코드와 종목코드는 필수 입니다.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 flex flex-col gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excd">
                거래소 코드 : (NYS, NAS, AMS, TSE, HKS, ...)
              </Label>
              <Input
                type="text"
                id="excd"
                value={excd}
                onChange={(e) => setExcd(e.target.value)}
                placeholder="거래소 코드를 입력해주세요."
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="symb">종목 코드 (APPL, TSLA)</Label>
              <Input
                type="text"
                id="symb"
                value={symb}
                onChange={(e) => setSymb(e.target.value)}
                placeholder="종목 코드를 입력해주세요."
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="gubn">구분</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setGubn('0')}
                  variant={gubn === '0' ? 'default' : 'outline'}
                >
                  일
                </Button>
                <Button
                  onClick={() => setGubn('1')}
                  variant={gubn === '1' ? 'default' : 'outline'}
                >
                  주
                </Button>
                <Button
                  onClick={() => setGubn('2')}
                  variant={gubn === '2' ? 'default' : 'outline'}
                >
                  월
                </Button>
              </div>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="modp">수정주가반영여부</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setModp('0')}
                  variant={modp === '0' ? 'default' : 'outline'}
                >
                  미반영
                </Button>
                <Button
                  onClick={() => setModp('1')}
                  variant={modp === '1' ? 'default' : 'outline'}
                >
                  반영
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <div className="flex items-center justify-end w-full gap-4">
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

export default DailyPrice;
