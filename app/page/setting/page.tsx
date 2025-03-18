'use client';

import { Title } from '@/components/title';
import Password from './Password';
import KeySetting from './KeySetting';
import AccordionSection from '@/components/accordionSection';
import SettingContent from './SettingContent';
import { useTempKeyStore } from '@/store/useTempKeyStore';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const Setting = () => {
  const { key } = useTempKeyStore();

  const [account, setAccount] = useState('account');

  return (
    <div className="flex flex-col gap-6">
      <Title
        title="설정"
        description="여기에 설정 되는 값은 서버에 저장하는 것이 아닙니다. 
          이 프로그램은 서버리스 프로그램입니다.
          브라우저의 저장 조차도 암호화하여 저장됩니다.
          어디로든 전달되지 않기 때문에 보안상 매우 안전하다고 할 수 있습니다.
          그리고 아래 키들이 있어야 자동매매가 가능합니다.
        "
      />
      <Password />
      <AccordionSection title="기타">
        <SettingContent
          title="계좌"
          value={
            <Tabs
              defaultValue="account"
              value={account}
              onValueChange={setAccount}
            >
              <TabsList>
                <TabsTrigger value="account">실전계좌</TabsTrigger>
                <TabsTrigger value="password">모의투자계좌</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <SettingContent
          title="최소 매수 금액 ($)"
          value={
            <div className="flex items-center gap-2">
              <Input className="w-24" />
            </div>
          }
        />
        <SettingContent
          title="최소예측률 (%)"
          value={
            <div className="flex items-center gap-2">
              <Input className="w-24" value="60" />
            </div>
          }
        />
        <SettingContent
          title="판매기준율 (%)"
          value={
            <div className="flex items-center gap-2">
              <Input className="w-24" value="2" />
            </div>
          }
        />
      </AccordionSection>
      <AccordionSection title="발급받은 토큰">
        <SettingContent title="접근토큰" value={key.access_token} />
        <SettingContent title="접근토큰유형" value={key.token_type} />
        <SettingContent
          title="접근토큰 유효기간"
          value={dayjs(key.expires_in).format('HH:mm:ss')}
        />
        <SettingContent
          title="접근토큰 유효기간(일시표시)"
          value={dayjs(key.access_token_token_expired).format('MM/DD HH:mm:ss')}
        />
      </AccordionSection>
      <AccordionSection title="한국투자증권 API KEY 설정">
        <KeySetting filed="appKey" label="실전계좌 app key" />
        <KeySetting filed="secretKey" label="실전계좌 secret key" />
        <KeySetting filed="vtsAppKey" label="모의투자계좌 app key" />
        <KeySetting filed="vtsSecretKey" label="모의투자계좌 secret key" />
      </AccordionSection>
      <AccordionSection title="기타">
        <div>key</div>
        <div>실전계좌 VS 모의투자계좌</div>
      </AccordionSection>
    </div>
  );
};
export default Setting;
