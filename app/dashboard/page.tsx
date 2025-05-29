"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  Wallet, // 잔고에 적합한 지갑 아이콘
  CheckSquare, // 체결에 적합한 체크 아이콘
  Clock, // 미체결에 적합한 시계 아이콘
  LineChart, // 기간손익에 적합한 차트 아이콘
  BarChart3, // 분석에 적합한 분석 차트 아이콘
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const data = {
  navMain: [
    {
      title: "잔고",
      url: "#",
      icon: Wallet,
      isActive: true,
    },
    {
      title: "체결",
      url: "#",
      icon: CheckSquare,
      isActive: false,
    },
    {
      title: "미체결",
      url: "#",
      icon: Clock,
      isActive: false,
    },
    {
      title: "기간손익",
      url: "#",
      icon: LineChart,
      isActive: false,
    },
    {
      title: "분석",
      url: "#",
      icon: BarChart3,
      isActive: false,
    },
  ],
  mails: [
    {
      name: "William Smith",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      date: "09:34 AM",
      teaser:
        "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
    },
    {
      name: "Alice Smith",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      date: "Yesterday",
      teaser:
        "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
    },
    {
      name: "Bob Johnson",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      date: "2 days ago",
      teaser:
        "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
    },
    {
      name: "Emily Davis",
      email: "emilydavis@example.com",
      subject: "Re: Question about Budget",
      date: "2 days ago",
      teaser:
        "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
    },
    {
      name: "Michael Wilson",
      email: "michaelwilson@example.com",
      subject: "Important Announcement",
      date: "1 week ago",
      teaser:
        "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
    },
    {
      name: "Sarah Brown",
      email: "sarahbrown@example.com",
      subject: "Re: Feedback on Proposal",
      date: "1 week ago",
      teaser:
        "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
    },
    {
      name: "David Lee",
      email: "davidlee@example.com",
      subject: "New Project Idea",
      date: "1 week ago",
      teaser:
        "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
    },
    {
      name: "Olivia Wilson",
      email: "oliviawilson@example.com",
      subject: "Vacation Plans",
      date: "1 week ago",
      teaser:
        "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
    },
    {
      name: "James Martin",
      email: "jamesmartin@example.com",
      subject: "Re: Conference Registration",
      date: "1 week ago",
      teaser:
        "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
    },
    {
      name: "Sophia White",
      email: "sophiawhite@example.com",
      subject: "Team Dinner",
      date: "1 week ago",
      teaser:
        "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
    },
  ],
};

export default function DashBoardPage() {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const [currentMail, setCurrentMail] = useState(data.mails[0]);

  const [mails, setMails] = useState(data.mails);
  const [api, setApi] = useState<CarouselApi>();

  // 현재 선택된 인덱스 추적
  const [currentIndex, setCurrentIndex] = useState(0);
  // 이벤트 핸들러 참조를 저장할 ref 추가
  const selectHandlerRef = useRef<(() => void) | undefined>(undefined);

  // 첫 번째 effect: 캐러셀 API 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    if (!api) return;

    // 슬라이드 변경 시 현재 메일 업데이트
    const selectHandler = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrentIndex(selectedIndex);
      setCurrentMail(mails[selectedIndex]);
    };

    // 참조에 핸들러 저장 (두 번째 effect에서 사용)
    selectHandlerRef.current = selectHandler;

    // 이벤트 리스너 등록
    api.on("select", selectHandler);

    // 초기 설정 (첫 번째 슬라이드로 이동)
    api.scrollTo(0);

    // 클린업 함수
    return () => {
      api.off("select", selectHandler);
      selectHandlerRef.current = undefined;
    };
  }, [api, mails]);

  // 두 번째 effect: currentMail이 변경될 때 캐러셀 위치 업데이트
  useEffect(() => {
    if (!api || !currentMail) return;

    const mailIndex = mails.findIndex((mail) => mail.name === currentMail.name);

    if (mailIndex >= 0 && mailIndex !== currentIndex) {
      // 저장한 핸들러 참조 사용
      const handler = selectHandlerRef.current;

      // 핸들러가 있으면 임시로 제거
      if (handler) {
        api.off("select", handler);
      }

      // 캐러셀 위치 업데이트
      api.scrollTo(mailIndex);
      setCurrentIndex(mailIndex);

      // 핸들러 다시 등록
      if (handler) {
        setTimeout(() => {
          api.on("select", handler);
        }, 0);
      }
    }
  }, [currentMail, mails, api, currentIndex]);

  return (
    <SidebarProvider
      className="h-full"
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible="icon"
        className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      >
        <Sidebar
          collapsible="none"
          className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                  <a href="#">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Command className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">감자 증권</span>
                      <span className="truncate text-xs">Enterprise</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => {
                          setActiveItem(item);
                          const mail = data.mails.sort(
                            () => Math.random() - 0.5
                          );
                          setMails(
                            mail.slice(
                              0,
                              Math.max(5, Math.floor(Math.random() * 10) + 1)
                            )
                          );
                        }}
                        isActive={activeItem?.title === item.title}
                        className="px-2.5 md:px-2"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        {/* This is the second sidebar */}
        {/* We disable collapsible and let it fill remaining space */}
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
                {mails.map((mail) => (
                  <a
                    href="#"
                    key={mail.email}
                    className={`box-border ${
                      currentMail.name === mail.name &&
                      "bg-primary-foreground border border-primary"
                    } flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight hover:bg-primary-foreground hover:text-sidebar-accent-foreground`}
                    onClick={() => setCurrentMail(mail)}
                  >
                    <div className="flex w-full items-center gap-2">
                      <span>{mail.name}</span>{" "}
                      <span className="ml-auto text-xs">{mail.date}</span>
                    </div>
                    <span className="font-medium">{mail.subject}</span>
                    <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                      {mail.teaser}
                    </span>
                  </a>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </Sidebar>
      <SidebarInset className="overflow-hidden flex flex-col h-svh">
        <header className="sticky top-0 flex shrink-0 items-center border-b bg-background p-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="shrink-0 flex gap-2">
              <div className="flex flex-col">
                <div className="text-xs text-neutral-500">나스닥 종합</div>
                <div className="flex items-center gap-1">
                  <div className="font-bold">19,220</div>
                  <div className="text-xs text-red-500">+0.68%</div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs text-neutral-500">평가손익</div>
                <div className="flex items-center gap-1">
                  <div className="font-bold">-1,557,131</div>
                  <div className="text-xs text-blue-500">-12.90%</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <SidebarMenuButton
              tooltip={{
                children: "설정",
                hidden: false,
              }}
            >
              <Settings />
            </SidebarMenuButton>
          </div>
        </header>
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <div className="shrink-0">
            <Carousel setApi={setApi}>
              <CarouselContent>
                {mails.map((mail, index) => (
                  <CarouselItem key={index} className="my-4">
                    <Card
                      className={`${
                        currentMail.name === mail.name &&
                        "border-primary bg-primary-foreground"
                      } mx-4 cursor-pointer h-full transition-all`}
                      onClick={() => setCurrentMail(mail)}
                    >
                      <CardContent className="px-4 flex flex-col">
                        <div className="flex w-full items-center justify-between mb-2">
                          <span className="font-medium truncate">
                            {mail.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {mail.date}
                          </span>
                        </div>
                        <span className="font-medium text-sm mb-1">
                          {mail.subject}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {mail.teaser}
                        </p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <Separator className="mr-2 h-4" />
          <div className="h-full overflow-y-scroll flex flex-col gap-4 p-4 scrollbar-hide">
            <Tabs defaultValue="chart">
              <TabsList>
                <TabsTrigger value="chart">차트</TabsTrigger>
                <TabsTrigger value="stock">종목정보</TabsTrigger>
                <TabsTrigger value="news">뉴스</TabsTrigger>
                <TabsTrigger value="community">커뮤니티</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <div className="py-2">
                  <CardTitle>차트</CardTitle>
                  <CardDescription>가려워 죽겠다. 벌레가 있나?</CardDescription>
                  <Separator className="my-4" />
                  <Card className="bg-white">
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Pedro Duarte" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="@peduarte" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="stock">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password here. After saving, ll be logged out.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="current">Current password</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new">New password</Label>
                      <Input id="new" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
