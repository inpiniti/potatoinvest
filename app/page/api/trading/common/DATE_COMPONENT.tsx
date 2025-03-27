import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

const DATE_COMPONENT = ({
  value,
  onChange,
  title,
  column,
}: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  column: string;
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={column}>
        {title} : {column} ( {value} )
      </Label>
      <Popover>
        <PopoverTrigger>
          <Button
            variant={"outline"}
            className={"w-[280px] justify-start text-left font-normal"}
          >
            <CalendarIcon />
            {value ? (
              dayjs(value).format("YYYY.MM.DD")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dayjs(value).toDate()}
            onSelect={(e) => onChange(dayjs(e).format("YYYYMMDD"))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DATE_COMPONENT;
