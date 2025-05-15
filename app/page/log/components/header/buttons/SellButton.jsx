import { Button } from "@/components/ui/button";
import { TrendingDown } from "lucide-react";

const SellButton = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="mr-1"
    >
      <TrendingDown className="h-3 w-3 mr-1" />
      매도
    </Button>
  );
};

export default SellButton;
