import { CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const SectionTitleItem = ({ title, date, info, description, active }) => {
  return (
    <CarouselItem className="my-4">
      <Card
        className={`${
          active && "border-primary bg-primary-foreground"
        } mx-4 cursor-pointer h-full transition-all`}
      >
        <CardContent className="px-4 flex flex-col">
          <div className="flex w-full items-center justify-between mb-2">
            <span className="font-medium truncate">{title}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <span className="font-medium text-sm mb-1">{info}</span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardContent>
      </Card>
    </CarouselItem>
  );
};
export default SectionTitleItem;
