const AsideItem = ({ title, date, info, description, onClick, active }) => {
  // 카드에 필요한 값
  // key
  // title
  // date
  // info
  // description

  return (
    <a
      href="#"
      className={`box-border ${
        active && "bg-white border border-primary"
      } flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight hover:bg-white hover:border-red-400 hover:border hover:text-sidebar-accent-foreground box-border`}
      onClick={onClick}
    >
      <div className="flex w-full items-center gap-2">
        <span className="whitespace-pre-wrap">{title}</span>
        <span className="ml-auto text-xs">{date}</span>
      </div>
      <span className="font-medium">{info}</span>
      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
        {description}
      </span>
    </a>
  );
};

export default AsideItem;
