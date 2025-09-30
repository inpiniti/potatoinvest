import * as React from 'react';
import { Plus } from 'lucide-react';

import { Calendars } from '@/components/calendars';
import { DatePicker } from '@/components/date-picker';
import { NavUser } from '@/components/nav-user';
import { NavAuthLoggedOut } from '@/components/nav-auth-logged-out';
import { AccountsSection } from '@/components/accounts-section';
import { TokenSection } from '@/components/token-section';
import { AccountBalanceSection } from '@/components/account-balance-section';
import { AccountSettingsSection } from '@/components/account-settings-section';
import { useStudioData } from '@/hooks/useStudioData';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  calendars: [
    {
      name: 'My Calendars',
      items: ['Personal', 'Work', 'Family'],
    },
    {
      name: 'Favorites',
      items: ['Holidays', 'Birthdays'],
    },
    {
      name: 'Other',
      items: ['Travel', 'Reminders', 'Deadlines'],
    },
  ],
};

export function SidebarRight(props: React.ComponentProps<typeof Sidebar>) {
  const { user, session, loadingSession, mutations } = useStudioData();
  const loggedIn = Boolean(session);

  const displayUser = React.useMemo(() => {
    if (!user) return null;
    return {
      name: user.user_metadata?.name || user.email || data.user.name,
      email: user.email || data.user.email,
      avatar: user.user_metadata?.avatar_url || data.user.avatar,
    };
  }, [user]);

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {loggedIn && displayUser ? (
          <NavUser
            user={displayUser}
            onLogout={async () => {
              await mutations.logout();
            }}
          />
        ) : (
          <NavAuthLoggedOut loading={loadingSession} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <AccountsSection disabled={!loggedIn} />
        <TokenSection />
        {loggedIn && <AccountBalanceSection isVts={false} />}
        {loggedIn && <AccountSettingsSection />}
        <div className="pt-2">
          <DatePicker />
        </div>
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled={!loggedIn}
              title={!loggedIn ? '로그인 후 사용 가능' : undefined}
            >
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
