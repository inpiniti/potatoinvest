'use client';

import { Input } from '@/components/ui/input';
import { tempKeyStore } from '@/store/tempKeyStore';

const Password = () => {
  const { key, setKey } = tempKeyStore();

  return (
    <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
      <div>
        <label className="font-bold">암호화용 salt</label>
        <div className="text-xs text-neutral-500">
          데이터 암, 복호화를 위한 salt입니다.
        </div>
      </div>
      <Input
        type="password"
        className="w-fit text-xs shrink-0"
        value={key.password}
        onChange={(e) => setKey({ password: e.target.value })}
      />
    </section>
  );
};

export default Password;
