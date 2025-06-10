import { CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const SectionTitleItem = ({ current, analysis, setCurrent }) => {
  return (
    <CarouselItem className="my-4">
      <Card
        className={`${
          current?.name === analysis.name &&
          "border-primary bg-primary-foreground"
        } mx-4 cursor-pointer h-full transition-all`}
        onClick={() => setCurrent(analysis)}
      >
        <CardContent className="px-4 flex flex-col">
          <div className="flex w-full items-center justify-between mb-2">
            <span className="font-medium truncate">{analysis.name}</span>
            <span className="text-xs text-muted-foreground">
              {analysis.market}
            </span>
          </div>
          <span className="font-medium text-sm mb-1">{analysis.close}</span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {analysis.description}
          </p>
        </CardContent>
      </Card>
    </CarouselItem>
  );
};
export default SectionTitleItem;
