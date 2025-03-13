import { Title } from '@/components/title';
import Password from './Password';
import KeySetting from './KeySetting';

const Setting = () => {
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
      <KeySetting filed="appKey" label="실전계좌 app key" />
      <KeySetting filed="secretKey" label="실전계좌 secret key" />
      <KeySetting filed="vtsAppKey" label="모의투자계좌 app key" />
      <KeySetting filed="vtsSecretKey" label="모의투자계좌 secret key" />
    </div>
  );
};
export default Setting;
