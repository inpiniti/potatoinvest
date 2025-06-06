import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const Aside = ({ activeItem, list, current, setCurrent }) => {
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
          <SidebarGroupContent>
            {list.map((analysis) => (
              <a
                href="#"
                key={analysis?.name}
                className={`box-border ${
                  current?.name === analysis?.name &&
                  "bg-primary-foreground border border-primary"
                } flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight hover:bg-primary-foreground hover:text-sidebar-accent-foreground`}
                onClick={() => setCurrent(analysis)}
              >
                <div className="flex w-full items-center gap-2">
                  <span>{analysis?.name}</span>{" "}
                  <span className="ml-auto text-xs">{analysis?.close}</span>
                </div>
                <span className="font-medium">{analysis?.change}</span>
                <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                  {analysis?.["Perf.W"]}
                </span>
              </a>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default Aside;
