import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

const RefreshAllButton = ({ onClick, disabled, isLoading }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <RefreshCw className="h-3 w-3 mr-1" />
      )}
      새로고침
    </Button>
  );
};

export default RefreshAllButton;
