import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import React from "react";

const Aside = React.forwardRef(
  ({ activeItem, length, children, subItems }, ref) => {
    const childrenArray = React.Children.toArray(children);
    return (
      <Sidebar collapsible="none" className="flex-1 flex overflow-hidden">
        <SidebarHeader className="gap-3.5 border-b px-4 h-15 flex flex-row justify-between items-center">
          <div className="text-base font-medium text-foreground flex gap-2">
            <activeItem.icon />
            {activeItem?.title}
            <Badge className="px-1">{length}</Badge>
          </div>
          {subItems}
        </SidebarHeader>
        {childrenArray.length === 2 ? (
          <>
            <SidebarHeader className="p-4 border-b">
              {childrenArray[0]}
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup className="p-0 pb-0.5">
                <SidebarGroupContent ref={ref}>
                  {childrenArray[1]}
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </>
        ) : (
          <SidebarContent>
            <SidebarGroup className="p-0 pb-0.5">
              <SidebarGroupContent ref={ref}>{children}</SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        )}
      </Sidebar>
    );
  }
);

export default Aside;
