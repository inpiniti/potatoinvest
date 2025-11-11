import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_COMPONENT = ({
  value,
  onChange,
  title,
  column,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  column: string;
  items: string[];
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={column}>
        {title} : {column} ( {value} )
      </Label>
      <Tabs value={value} onValueChange={onChange}>
        <TabsList>
          {items.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TAB_COMPONENT;
