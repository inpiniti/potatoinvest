import React from "react"; // React import 추가
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";

const PageWrap = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <SidebarProvider
      className="h-full"
      style={{
        "--sidebar-width": "350px",
      }}
    >
      <Sidebar
        collapsible="icon"
        className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      >
        {childrenArray?.[0]}
        {childrenArray?.[1]}
      </Sidebar>
      {childrenArray?.[2]}
    </SidebarProvider>
  );
};

export default PageWrap;
