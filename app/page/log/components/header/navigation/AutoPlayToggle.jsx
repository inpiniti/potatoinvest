import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AutoPlayToggle = ({ autoPlay, toggleAutoPlay, hasData, isLoading }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 mr-2">
            <Switch
              id="auto-play"
              checked={autoPlay}
              onCheckedChange={toggleAutoPlay}
              disabled={!hasData || isLoading}
            />
            <Label htmlFor="auto-play" className="text-xs">
              auto
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>3초마다 자동으로 다음 종목으로 이동합니다</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AutoPlayToggle;