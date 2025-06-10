import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const Aside = ({ activeItem, children }) => {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="text-base font-medium text-foreground flex gap-2">
          <activeItem.icon />
          {activeItem?.title}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0 pb-0.5">
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default Aside;
