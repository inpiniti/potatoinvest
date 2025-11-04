import { Button } from '@/components/ui/button';
import { HiOutlineBanknotes } from 'react-icons/hi2';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineRecommend } from 'react-icons/md';

const Studio4 = () => {
  return (
    <>
      <Button variant="outline" size="sm">
        <HiOutlineBanknotes /> 계좌
      </Button>
      <Button variant="outline" size="sm">
        <IoPersonCircleOutline />
        보유종목
      </Button>
      <Button variant="outline" size="sm">
        <MdOutlineRecommend />
        추천종목
      </Button>
    </>
  );
};

export default Studio4;
