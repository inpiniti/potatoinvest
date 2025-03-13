"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKeyStore } from "@/store/useKeyStore";
import { useTempKeyStore } from "@/store/useTempKeyStore";
import { useState } from "react";

const KeySetting = ({ filed = "appKey", label = "실전계좌 app key" }) => {
  const { key, setKey, getKey } = useKeyStore();
  const { key: tempKey } = useTempKeyStore();

  const [word, setWord] = useState("");

  // 저장 토글
  const [saveToggle, setSaveToggle] = useState(false);

  // 복호화 토글
  const [toggle, setToggle] = useState(false);

  // useEffect(() => {
  //   if (key[filed]) {
  //     setWord(key[filed]);
  //   }
  // }, [key[filed]]);

  return (
    <section className="bg-white border rounded-sm overflow-hidden p-4 flex justify-between items-center gap-4">
      <div className="flex flex-col text-sm shrink-0">
        <label className="font-bold">{label}</label>
      </div>
      <div className="flex gap-2 items-center overflow-hidden grow-1">
        {saveToggle ? (
          <>
            <Input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={
                tempKey.password === "" ? "암호화용 비번이 필요" : ""
              }
              disabled={tempKey.password === ""}
            />
            <Button
              onClick={() => {
                setKey({
                  ...key,
                  [filed]: word,
                  filed,
                });
                setWord(key[filed]);
                setSaveToggle(!saveToggle);
              }}
              disabled={tempKey.password === ""}
            >
              저장
            </Button>
          </>
        ) : (
          <>
            <p className="grow-1 truncate text-right">{word || key[filed]}</p>
            {!toggle && (
              <Button
                className="shrink-0"
                onClick={() => {
                  setSaveToggle(!saveToggle);
                  setWord("");
                }}
                disabled={tempKey.password === ""}
                variant="destructive"
              >
                수정
              </Button>
            )}

            <Button
              className="shrink-0"
              onClick={() => {
                if (toggle) {
                  setWord(key[filed]);
                } else {
                  const _key = getKey();
                  setWord(_key[filed]);
                }
                setToggle(!toggle);
              }}
              disabled={tempKey.password === ""}
              variant="secondary"
            >
              {toggle ? "원복" : "복호화"}
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default KeySetting;
