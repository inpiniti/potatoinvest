import { Button } from '@/components/ui/button';

const ApiContent = ({
  title,
  endPoint,
  children,
}: Readonly<{
  title: string;
  endPoint: string;
  children?: React.ReactNode;
}>) => {
  return (
    <section className="flex items-center justify-between p-4 text-neutral-300">
      <div className="flex flex-col gap-1">
        <b>{title}</b>
        <p>{endPoint}</p>
      </div>
      {children ?? <Button disabled>API 호출</Button>}
    </section>
  );
};

export default ApiContent;
