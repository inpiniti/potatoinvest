import { CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const SectionTitleItem = ({
  title,
  date,
  info,
  description,
  active,
  logoUrl,
  badge,
}) => {
  return (
    <CarouselItem className="my-4">
      <Card
        className={`${
          active && "border-primary bg-primary-foreground"
        } mx-4 cursor-pointer h-full transition-all`}
      >
        <CardContent className="px-4 flex items-center gap-4">
          <Avatar className="shrink-0 w-14 h-14 rounded-2xl">
            <AvatarImage
              src={logoUrl}
              alt={title}
              className={`object-contain`}
            />
            <AvatarFallback className={`text-md font-bold rounded-2xl`}>
              {title.substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex w-full items-center justify-between mb-2">
              <span className="font-medium truncate">{title}</span>
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
            <span className="font-medium text-sm mb-1">{info}</span>
            <p className="text-xs text-muted-foreground line-clamp-2">
              <Badge className={!badge?.[0] && "hidden"}>보유</Badge>
              <Badge className={!badge?.[1] && "hidden"}>체결</Badge>
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  );
};
export default SectionTitleItem;
