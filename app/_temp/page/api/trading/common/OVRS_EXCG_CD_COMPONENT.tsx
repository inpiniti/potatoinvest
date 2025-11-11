import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OVRS_EXCG_CD_COMPONENT = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="OVRS_EXCG_CD">
        해외거래소코드 : OVRS_EXCG_CD ( {value} )
      </Label>
      <Tabs defaultValue="OVRS_EXCG_CD" value={value} onValueChange={onChange}>
        <TabsList>
          <TabsTrigger value="NASD">나스닥</TabsTrigger>
          <TabsTrigger value="NYSE">뉴욕</TabsTrigger>
          <TabsTrigger value="AMEX">아멕스</TabsTrigger>
          <TabsTrigger value="SEHK">홍콩</TabsTrigger>
          <TabsTrigger value="SHAA">상해</TabsTrigger>
          <TabsTrigger value="SZAA">심천</TabsTrigger>
          <TabsTrigger value="TKSE">일본</TabsTrigger>
          <TabsTrigger value="HASE">베트남 하노이</TabsTrigger>
          <TabsTrigger value="VNSE">베트남 호치민</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default OVRS_EXCG_CD_COMPONENT;
