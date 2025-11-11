import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AutoPlayToggle = ({ autoPlay, toggleAutoPlay }) => {
  return (
    <div className="flex items-center gap-2 mr-2">
      <Switch
        id="auto-play"
        checked={autoPlay}
        onCheckedChange={toggleAutoPlay}
      />
      <Label htmlFor="auto-play" className="text-xs">
        auto
      </Label>
    </div>
  );
};

export default AutoPlayToggle;
