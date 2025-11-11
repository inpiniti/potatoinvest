import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INPUT_COMPONENT = ({
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
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default INPUT_COMPONENT;
