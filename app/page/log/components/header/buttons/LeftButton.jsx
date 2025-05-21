import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LeftButton = ({ onClick }) => {
  return (
    <Button variant="secondary" size="icon" onClick={onClick}>
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default LeftButton;
