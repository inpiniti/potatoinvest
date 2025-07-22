import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const AsideItem = ({
  title,
  date,
  info,
  description,
  onClick,
  active,
  logoUrl,
  badge,
  ...props
}) => {
  // 카드에 필요한 값
  // key
  // title
  // date
  // info
  // description

  return (
    <a
      {...props}
      href="#"
      className={`box-border ${
        active && 'bg-white border border-primary'
      } flex w-full items-center gap-2 border-b p-4 text-sm leading-tight hover:bg-white hover:border-red-400 hover:border hover:text-sidebar-accent-foreground box-border`}
      onClick={onClick}
    >
      <Avatar className="shrink-0 w-14 h-14 rounded-2xl">
        <AvatarImage src={logoUrl} alt={title} className={`object-contain`} />
        <AvatarFallback className={`text-md font-bold rounded-2xl`}>
          {title.substring(0, 1)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col items-start gap-2 whitespace-nowrap overflow-hidden">
        <div className="flex w-full items-center gap-2">
          <span className="truncate overflow-hidden text-ellipsis font-bold">
            {title}
          </span>
          <span className="ml-auto text-xs">{date}</span>
        </div>
        <span className="font-medium">{info}</span>
        <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
          <Badge className={!badge?.[0] && 'hidden'}>보유</Badge>
          <Badge className={!badge?.[1] && 'hidden'}>체결</Badge>
          <Badge className={!badge?.[2] && 'hidden'}>미체결</Badge>
          <Badge className={!badge?.[3] && 'hidden'}>오를확률</Badge>
          <Badge className={!badge?.[3] && 'hidden'}>
            {badge?.[3]?.toFixed(2)}
          </Badge>

          {description}
        </span>
      </div>
    </a>
  );
};

export default AsideItem;
