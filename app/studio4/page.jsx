import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { IoPersonCircleOutline } from "react-icons/io5";
import { MdOutlineRecommend } from "react-icons/md";

const Studio4 = () => {
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm" disabled>
        <Link href="/studio4/held">
          <IoPersonCircleOutline /> 보유종목
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/studio4/recommend">
          <MdOutlineRecommend /> 추천종목
        </Link>
      </Button>
    </div>
  );
};

export default Studio4;
