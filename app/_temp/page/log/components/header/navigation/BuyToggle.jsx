import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BuyToggle = ({ autoBuy, onToggleAutoBuy }) => {
  return (
    <div className="flex items-center gap-2 mr-2">
      <Switch
        id="auto-buy"
        checked={autoBuy}
        onCheckedChange={onToggleAutoBuy}
      />
      <Label htmlFor="auto-buy" className="text-xs flex items-center">
        buy
      </Label>
    </div>
  );
};

export default BuyToggle;
