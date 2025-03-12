"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeyStore } from "@/store/useKeyStore";
import { useEffect, useState } from "react";

const AppKey = () => {
  const { key, setKey, getKey } = useKeyStore();
  const [appKey, setAppKey] = useState("");
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (key.appKey) {
      setAppKey(key.appKey);
    }
  }, [key.appKey]);

  return (
    <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
      <div className="flex flex-col text-sm shrink-0">
        <label className="font-bold">실전계좌</label>
        <label className="font-bold">app key</label>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={appKey}
          onChange={(e) => setAppKey(e.target.value)}
        />
        <Button
          onClick={() => {
            setKey({ ...key, appKey });
          }}
        >
          저장
        </Button>
        <Button
          onClick={() => {
            if (toggle) {
              setAppKey(key.appKey);
            } else {
              const _key = getKey();
              setAppKey(_key.appKey);
            }
            setToggle(!toggle);
          }}
        >
          {toggle ? "원복" : "복호화"}
        </Button>
      </div>
    </section>
  );
};

export default AppKey;
