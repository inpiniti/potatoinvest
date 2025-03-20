import { Button } from '@/components/ui/button';

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
  return (
    <section className="flex flex-col p-4 gap-4">
      <div
        className={`flex items-center justify-between ${
          disabled && 'text-neutral-300'
        }`}
      >
        <div className="flex flex-col gap-1">
          <b>{title}</b>
          <p>{endPoint}</p>
        </div>
        {children ?? <Button disabled>API 호출</Button>}
      </div>
      {result && (
        <div className="w-full bg-neutral-500 text-white rounded-md p-4 overflow-hidden whitespace-pre-wrap">
          {result || 'API의 결과가 여기에 표시됩니다.'}
        </div>
      )}
    </section>
  );
};

export default ApiContent;
