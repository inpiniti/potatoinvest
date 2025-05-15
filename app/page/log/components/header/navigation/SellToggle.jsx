import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SellToggle = ({ autoSell, onToggleAutoSell, isLoading }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 mr-2">
            <Switch
              id="auto-sell"
              checked={autoSell}
              onCheckedChange={onToggleAutoSell}
              disabled={isLoading}
            />
            <Label htmlFor="auto-sell" className="text-xs flex items-center">
              sell
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>수익률 2% 이상인 보유 종목 자동 매도</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SellToggle;