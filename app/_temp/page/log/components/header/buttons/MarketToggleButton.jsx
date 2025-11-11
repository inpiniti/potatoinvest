import { Button } from "@/components/ui/button";
import { BarChart3, BarChartHorizontal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MarketToggleButton = ({ showMarket, toggleMarket }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary" size="icon" onClick={toggleMarket}>
            {showMarket ? (
              <BarChartHorizontal size={16} />
            ) : (
              <BarChart3 size={16} className="text-gray-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showMarket ? "시장 지표 숨기기" : "시장 지표 표시하기"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MarketToggleButton;
