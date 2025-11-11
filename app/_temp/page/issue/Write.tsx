'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const Write = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? (
        <>
          <div className="flex flex-col gap-2">
            <div className="shrink-0">제목</div>
            <Input placeholder="제목을 입력해주세요." className="bg-white" />
          </div>
          <div className="flex flex-col gap-2">
            본문
            <Textarea placeholder="내용을 입력해주세요." className="bg-white" />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              className="w-fit"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button className="w-fit">등록</Button>
          </div>
        </>
      ) : (
        <Button className="w-fit" onClick={() => setOpen(true)}>
          건의사항 등록하기
        </Button>
      )}
    </>
  );
};

export default Write;
