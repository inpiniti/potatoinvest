import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BuyToggle = ({ autoBuy, onToggleAutoBuy, isLoading, activeTab }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 mr-2">
            <Switch
              id="auto-buy"
              checked={autoBuy}
              onCheckedChange={onToggleAutoBuy}
              disabled={isLoading}
            />
            <Label htmlFor="auto-buy" className="text-xs flex items-center">
              buy
            </Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {activeTab === "구매"
              ? "손실률 -10% 이하 보유 종목 자동 추가 매수"
              : "선택된 종목 자동 매수"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BuyToggle;