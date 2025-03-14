interface SettingContentProps {
  title: string;
  value: string;
}

const SettingContent = ({ title, value }: SettingContentProps) => {
  return (
    <section className="flex justify-between items-center p-4 gap-4 overflow-hidden">
      <b className="font-bold shrink-0">{title}</b>
      <p className="grow-1 text-right overflow-hidden text-ellipsis whitespace-nowrap">
        {value}
      </p>
    </section>
  );
};

export default SettingContent;
