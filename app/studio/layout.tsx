"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

export const studioMainNav = [
  { title: "Home", url: "/studio/home" },
  { title: "Ask AI", url: "/studio/ask-ai" },
  { title: "Inbox", url: "/studio/inbox" },
  { title: "Projects", url: "/studio/projects" },
];

function useBreadcrumbTitle() {
  const pathname = usePathname();
  if (!pathname) return "Studio";
  if (pathname === "/studio") return "Home";
  const match = studioMainNav.find((i) => pathname.startsWith(i.url));
  return match ? match.title : "Studio";
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const title = useBreadcrumbTitle();
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
