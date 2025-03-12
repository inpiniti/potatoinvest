import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Password from "./Password";
import AppKey from "./AppKey";

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
      <AppKey />

      <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
        <div className="flex flex-col text-sm shrink-0">
          <label className="font-bold">실전계좌</label>
          <label className="font-bold">secret key</label>
        </div>
        <div className="flex gap-4">
          <Input type="password" />
          <Button>저장</Button>
        </div>
      </section>

      <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
        <div className="flex flex-col text-sm shrink-0">
          <label className="font-bold">모의투자계좌</label>
          <label className="font-bold">app key</label>
        </div>
        <div className="flex gap-4">
          <Input type="password" />
          <Button>저장</Button>
        </div>
      </section>

      <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
        <div className="flex flex-col text-sm shrink-0">
          <label className="font-bold">모의투자계좌</label>
          <label className="font-bold">secret key</label>
        </div>
        <div className="flex gap-4">
          <Input type="password" />
          <Button>저장</Button>
        </div>
      </section>
    </div>
  );
};
export default Setting;
