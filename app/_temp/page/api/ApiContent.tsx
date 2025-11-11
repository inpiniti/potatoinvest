import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ApiContent = ({
  title,
  endPoint,
  children,
  disabled = true,
  result,
}: Readonly<{
  title: string;
  endPoint: string;
  children?: React.ReactNode;
  disabled?: boolean;
  result?: string;
}>) => {
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (!!result) {
      setToggle(true);
    }
  }, [result]);

  return (
    <section
      className={`flex flex-col p-4 gap-4 ${
        result && "hover:text-blue-400 cursor-pointer hover:bg-neutral-50"
      }`}
      onClick={() => setToggle(!toggle)}
    >
      <div
        className={`flex items-center justify-between ${
          disabled && "text-neutral-300"
        }`}
      >
        <div className="flex flex-col gap-1">
          <b>{title}</b>
          <p>{endPoint}</p>
        </div>
        {children ?? <Button disabled>API 호출</Button>}
      </div>
      {result && toggle && (
        <div
          className="w-full bg-neutral-500 text-white rounded-md p-4 overflow-hidden whitespace-pre-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          {result || "API의 결과가 여기에 표시됩니다."}
        </div>
      )}
    </section>
  );
};

export default ApiContent;
