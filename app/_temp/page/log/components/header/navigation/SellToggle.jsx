import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SellToggle = ({ autoSell, onToggleAutoSell }) => {
  return (
    <div className="flex items-center gap-2 mr-2">
      <Switch
        id="auto-sell"
        checked={autoSell}
        onCheckedChange={onToggleAutoSell}
      />
      <Label htmlFor="auto-sell" className="text-xs flex items-center">
        sell
      </Label>
    </div>
  );
};

export default SellToggle;
