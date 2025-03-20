interface SettingContentProps {
  title: string;
  value: React.ReactNode | string;
}

const SettingContent = ({ title, value }: SettingContentProps) => {
  return (
    <section className="flex justify-between items-center p-4 gap-4 overflow-hidden">
      <b className="font-bold shrink-0">{title}</b>
      <div className="grow-1 flex justify-end text-right overflow-hidden text-ellipsis whitespace-nowrap">
        {value}
      </div>
    </section>
  );
};

export default SettingContent;
