import { SidebarInset } from "@/components/ui/sidebar";

const Main = ({ children }) => {
  return (
    <SidebarInset className="overflow-hidden flex flex-col h-svh">
      {children}
    </SidebarInset>
  );
};

export default Main;
