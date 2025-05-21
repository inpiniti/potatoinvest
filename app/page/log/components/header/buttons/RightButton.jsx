import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const RightButton = ({ onClick }) => {
  return (
    <Button variant="secondary" size="icon" onClick={onClick}>
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
};

export default RightButton;
