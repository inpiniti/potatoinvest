import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const DetailRefreshButton = ({ onClick, disabled }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="mr-1"
    >
      <RefreshCw className="h-3 w-3" />
    </Button>
  );
};

export default DetailRefreshButton;
