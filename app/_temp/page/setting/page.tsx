'use client';

import { Title } from '@/components/title';
import Password from './Password';
import KeySetting from './KeySetting';
import AccordionSection from '@/components/accordionSection';
import SettingContent from './SettingContent';
import { tempKeyStore } from '@/store/tempKeyStore';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { keyStore } from '@/store/keyStore';
import { settingStore } from '@/store/settingStore';
import { Button } from '@/components/ui/button';
import useToken from '@/hooks/useToken';

const Setting = () => {
  const { key: tempKey, realKey } = tempKeyStore();
  const { key, setIsVts } = keyStore();

  const { setting, setSetting } = settingStore();

  const { 토큰발급 } = useToken();

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
              defaultValue="isVts"
              value={String(key.isVts)}
              onValueChange={(e) => setIsVts(e === 'true')}
            >
              <TabsList>
                <TabsTrigger value="false">실전계좌</TabsTrigger>
                <TabsTrigger value="true">모의투자계좌</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <KeySetting filed="account" label="실전 계좌번호" />
        <KeySetting filed="vtsAccount" label="모의투자 계좌번호" />
        <SettingContent
          title="최소 매수 금액"
          value={
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                value={setting.other.minBuyAmount}
                onChange={(e) =>
                  setSetting({
                    other: { ...setting.other, minBuyAmount: e.target.value },
                  })
                }
              />
            </div>
          }
        />
        <SettingContent
          title="최소예측률 (%)"
          value={
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                value={setting.other.minPredictRate}
                onChange={(e) =>
                  setSetting({
                    other: { ...setting.other, minPredictRate: e.target.value },
                  })
                }
              />
            </div>
          }
        />
        <SettingContent
          title="매도 기준 (%)"
          value={
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                value={setting.other.sellRate}
                onChange={(e) =>
                  setSetting({
                    other: { ...setting.other, sellRate: e.target.value },
                  })
                }
              />
            </div>
          }
        />
        <SettingContent
          title="매수 기준 (%)"
          value={
            <div className="flex items-center gap-2">
              <Input
                className="w-24"
                value={setting.other.buyRate}
                onChange={(e) =>
                  setSetting({
                    other: { ...setting.other, buyRate: e.target.value },
                  })
                }
              />
            </div>
          }
        />
      </AccordionSection>

      <AccordionSection title="실전 토큰">
        <SettingContent title="접근토큰" value={realKey.access_token} />
        <SettingContent title="접근토큰유형" value={realKey.token_type} />
        <SettingContent
          title="접근토큰 유효기간"
          value={dayjs(realKey.expires_in).format('HH:mm:ss')}
        />
        <SettingContent
          title="접근토큰 유효기간(일시표시)"
          value={dayjs(realKey.access_token_token_expired).format(
            'MM/DD HH:mm:ss'
          )}
        />
        <SettingContent
          title="토큰 초기화 및 발급"
          value={<Button onClick={토큰발급}>발급</Button>}
        />
      </AccordionSection>

      <AccordionSection title="모의 토큰">
        <SettingContent title="접근토큰" value={tempKey.access_token} />
        <SettingContent title="접근토큰유형" value={tempKey.token_type} />
        <SettingContent
          title="접근토큰 유효기간"
          value={dayjs(tempKey.expires_in).format('HH:mm:ss')}
        />
        <SettingContent
          title="접근토큰 유효기간(일시표시)"
          value={dayjs(tempKey.access_token_token_expired).format(
            'MM/DD HH:mm:ss'
          )}
        />
      </AccordionSection>

      <AccordionSection title="한국투자증권 API KEY 설정">
        <KeySetting filed="appKey" label="실전계좌 app key" />
        <KeySetting filed="secretKey" label="실전계좌 secret key" />
        <KeySetting filed="vtsAppKey" label="모의투자계좌 app key" />
        <KeySetting filed="vtsSecretKey" label="모의투자계좌 secret key" />
      </AccordionSection>
    </div>
  );
};
export default Setting;
