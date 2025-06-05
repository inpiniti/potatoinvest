import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SectionHeader = ({ children }) => {
  return (
    <header className="sticky top-0 flex items-center border-b bg-background px-4 py-1 justify-between">
      <div className="flex items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
};
export default SectionHeader;
