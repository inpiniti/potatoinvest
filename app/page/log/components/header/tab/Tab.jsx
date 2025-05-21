import { Badge } from "@/components/ui/badge";
import { TabsTrigger } from "@/components/ui/tabs";

const Tab = ({ title, value, dataList }) => {
  return (
    <TabsTrigger value={value}>
      {title}
      {dataList.length > 0 && (
        <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
          {dataList.length}
        </Badge>
      )}
    </TabsTrigger>
  );
};

export default Tab;
