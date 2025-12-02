import * as React from "react"
import { User, Building2, Key, Wallet, DollarSign } from "lucide-react"
import { AccountAddButton } from "@/components/sections/account-add-button"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import { LoginSection } from "@/components/sections/login-section"
import { AccountSection } from "@/components/sections/account-section"
import { TokenSection } from "@/components/sections/token-section"
import { AssetSection } from "@/components/sections/asset-section"
import { ExchangeRateSection } from "@/components/sections/exchange-rate-section"

export function TradingSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="border-sidebar-border h-16 border-b">
                <div className="flex h-full items-center gap-2 px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Wallet className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Potato Invest</span>
                        <span className="text-xs text-muted-foreground">퀀트 트레이딩</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* 로그인 섹션 */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        로그인
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <LoginSection />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-0" />

                {/* 계좌 섹션 */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center justify-between pr-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            계좌
                        </div>
                        <AccountAddButton />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <AccountSection />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-0" />

                {/* 토큰 섹션 */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        토큰
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <TokenSection />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-0" />

                {/* 자산정보 섹션 */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        자산정보
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <AssetSection />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-0" />

                {/* 환율정보 섹션 */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        환율정보
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ExchangeRateSection />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-xs text-muted-foreground">
                            <span>v0.2.6</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
