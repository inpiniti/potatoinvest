import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const BuyButton = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="mr-1"
    >
      <ShoppingCart className="h-3 w-3 mr-1" />
      매수
    </Button>
  );
};

export default BuyButton;
